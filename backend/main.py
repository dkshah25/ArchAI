import os
import json
import uuid
import sqlite3
import shutil
import logging
from contextlib import asynccontextmanager
from urllib.parse import urlparse
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
import git

from parser import RepositoryParser
from services.ai_service import AIService

# ─── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("archai")

# ─── Configuration ────────────────────────────────────────────────────────────
DB_PATH = os.getenv("DATABASE_URL", "archai.db")
CLONE_DIR = "cloned_repos"
ALLOWED_GIT_HOSTS = {"github.com", "gitlab.com", "bitbucket.org", "codeberg.org"}
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
    if o.strip()
]

# ─── Lifespan (replaces deprecated @app.on_event) ────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown logic."""
    os.makedirs(CLONE_DIR, exist_ok=True)
    schema_path = os.path.join("database", "schema.sql")
    if os.path.exists(schema_path):
        with open(schema_path, "r") as f:
            schema_sql = f.read()
        conn = get_db()
        try:
            conn.executescript(schema_sql)
            conn.commit()
            logger.info("Database initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing database schema: {e}")
        finally:
            conn.close()
    logger.info("ArchAI backend started — API ready.")
    yield
    logger.info("ArchAI backend shutting down.")

app = FastAPI(
    title="ArchAI Backend API",
    version="1.0.0",
    description="AI-powered Software Architect API — transforms repositories into interactive architecture intelligence.",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

ai_service = AIService()

# ─── URL Validation ──────────────────────────────────────────────────────────
def validate_git_url(url: str) -> bool:
    """Validates that a git URL points to an allowed public host (SSRF protection)."""
    try:
        parsed = urlparse(url)
        host = parsed.hostname or ""
        # Strip www. prefix
        host = host.removeprefix("www.")
        return parsed.scheme in ("http", "https") and host in ALLOWED_GIT_HOSTS
    except Exception:
        return False

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Helper to convert sqlite3 rows to dictionaries
def row_to_dict(row):
    return dict(row) if row else None

# ─── Health Check ────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["System"])
def health_check():
    """Returns service health status. Used by monitoring and load balancers."""
    try:
        conn = get_db()
        conn.execute("SELECT 1")
        conn.close()
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {e}"
    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "version": "1.0.0",
        "database": db_status,
    }

# ─── Request schemas ─────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    git_url: str
    repo_name: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class PRReviewRequest(BaseModel):
    source_branch: str
    target_branch: str
    pr_number: int

class EditDiagramRequest(BaseModel):
    instruction: str
    current_mermaid: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class CopilotRequest(BaseModel):
    prompt: str

class SimulateRequest(BaseModel):
    change_prompt: str

class GraphQueryRequest(BaseModel):
    query_text: str

# Endpoints
@app.post("/api/analyze", tags=["Repositories"])
def analyze_repo(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Clones and analyzes a repository.
    Accepts public GitHub/GitLab/Bitbucket URLs or a demo keyword for sandbox testing.
    """
    git_url = req.git_url.strip()
    
    # Handle Mock Repo Request (demo keywords bypass URL validation)
    DEMO_KEYWORDS = {"demo", "mock", "fastapi", "ecommerce", "microservices"}
    is_demo = git_url.lower() in DEMO_KEYWORDS or not git_url.startswith("http")
    
    # Validate real URLs against allowlist to prevent SSRF
    if not is_demo and not validate_git_url(git_url):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid repository URL. Only public repositories on GitHub, GitLab, Bitbucket, and Codeberg are supported."
        )
    
    repo_id = str(uuid.uuid4())
    repo_name = req.repo_name or (git_url.split("/")[-1].replace(".git", "") if not is_demo else git_url)
    owner = git_url.split("/")[-2] if "/" in git_url and not is_demo else "demo-user"
    
    # Prepare clean directory path
    local_path = os.path.join(CLONE_DIR, repo_id)
    
    if is_demo:
        os.makedirs(local_path, exist_ok=True)
        _create_mock_codebase(local_path, repo_name)
    else:
        # Perform Git Clone (shallow, depth=1 for speed)
        try:
            logger.info(f"Cloning repository: {git_url}")
            git.Repo.clone_from(git_url, local_path, depth=1)
            logger.info(f"Clone complete: {repo_name}")
        except Exception as e:
            logger.warning(f"Failed to clone {git_url}: {e}. Falling back to mock codebase.")
            is_demo = True
            os.makedirs(local_path, exist_ok=True)
            _create_mock_codebase(local_path, repo_name)

    # Run Parser
    parser = RepositoryParser(local_path)
    parser.scan()
    
    file_tree = parser.get_file_tree()
    diagram_data = parser.generate_diagram_data()
    
    # Generate AI Summary
    summary = ai_service.generate_summary(parser.files, parser.component_types, parser.stats)
    
    # Run Architecture Evaluation Framework
    static_benchmarks = diagram_data.get("benchmarks", {})
    static_scores = static_benchmarks.get("scores", {})
    try:
        ai_eval = ai_service.evaluate_architecture(
            parser.files,
            parser.component_types,
            parser.stats,
            diagram_data.get("warnings", []),
            static_scores
        )
        diagram_data["benchmarks"] = {
            "scores": ai_eval.get("scores", static_scores),
            "strengths": ai_eval.get("strengths", static_benchmarks.get("strengths", [])),
            "weaknesses": ai_eval.get("weaknesses", static_benchmarks.get("weaknesses", [])),
            "refactoring": ai_eval.get("refactoring", static_benchmarks.get("refactoring", [])),
            "report": ai_eval.get("report", ""),
            "startup": static_benchmarks.get("startup", {}),
            "enterprise": static_benchmarks.get("enterprise", {}),
            "open_source": static_benchmarks.get("open_source", {})
        }
    except Exception as ex:
        print(f"AI architecture evaluation failed: {ex}")
    
    # Write to Database
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Save repo info
        cursor.execute(
            "INSERT OR REPLACE INTO repositories (id, name, owner, git_url, main_branch, last_analyzed) VALUES (?, ?, ?, ?, ?, datetime('now'))",
            (repo_id, repo_name, owner, git_url, "main")
        )
        
        # Save version
        commit_hash = "head-mock-sha" if is_demo else _get_latest_commit_sha(local_path)
        version_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO diagram_versions (id, repo_id, commit_hash, mermaid_code, nodes_json, summary_text) VALUES (?, ?, ?, ?, ?, ?)",
            (version_id, repo_id, commit_hash, diagram_data["system_graph"]["mermaid"], json.dumps(diagram_data), summary)
        )

        # Graph Knowledge Graph extraction and DB saving (Phase 6)
        try:
            entities, relations = parser.extract_graph_entities_and_relations()
            
            # Clear old graphs
            cursor.execute("DELETE FROM graph_entities WHERE repo_id = ?", (repo_id,))
            cursor.execute("DELETE FROM graph_relations WHERE repo_id = ?", (repo_id,))
            
            # Insert entities
            for ent in entities:
                cursor.execute(
                    "INSERT OR REPLACE INTO graph_entities (id, repo_id, name, type, file_path, metadata_json) VALUES (?, ?, ?, ?, ?, ?)",
                    (ent["id"], repo_id, ent["name"], ent["type"], ent["file_path"], json.dumps(ent["metadata"]))
                )
                
            # Insert relations
            for rel in relations:
                rel_id = str(uuid.uuid4())
                cursor.execute(
                    "INSERT OR REPLACE INTO graph_relations (id, repo_id, source_id, target_id, type) VALUES (?, ?, ?, ?, ?)",
                    (rel_id, repo_id, rel["source"], rel["target"], rel["type"])
                )
        except Exception as graph_err:
            print(f"Failed to save architectural knowledge graph entities: {graph_err}")

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database save error: {str(e)}")
    finally:
        conn.close()
        
    return {
        "repo_id": repo_id,
        "name": repo_name,
        "owner": owner,
        "git_url": git_url,
        "file_tree": file_tree,
        "diagram": diagram_data,
        "summary": summary,
        "commit_hash": commit_hash
    }

@app.get("/api/repos")
def get_repositories():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM repositories ORDER BY last_analyzed DESC")
    repos = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()
    return repos

@app.get("/api/compare/{repo_a_id}/{repo_b_id}")
def compare_repos(repo_a_id: str, repo_b_id: str):
    """Compares the architecture and benchmarks of two repositories."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Fetch Repo A details
    cursor.execute("SELECT name FROM repositories WHERE id = ?", (repo_a_id,))
    repo_a = cursor.fetchone()
    if not repo_a:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Repository A ({repo_a_id}) not found")
    repo_a_name = repo_a["name"]
    
    cursor.execute("SELECT nodes_json FROM diagram_versions WHERE repo_id = ? ORDER BY created_at DESC LIMIT 1", (repo_a_id,))
    ver_a = cursor.fetchone()
    if not ver_a:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Repository A has no analyzed diagram versions")
    repo_a_data = json.loads(ver_a["nodes_json"])
    
    # Fetch Repo B details
    cursor.execute("SELECT name FROM repositories WHERE id = ?", (repo_b_id,))
    repo_b = cursor.fetchone()
    if not repo_b:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Repository B ({repo_b_id}) not found")
    repo_b_name = repo_b["name"]
    
    cursor.execute("SELECT nodes_json FROM diagram_versions WHERE repo_id = ? ORDER BY created_at DESC LIMIT 1", (repo_b_id,))
    ver_b = cursor.fetchone()
    if not ver_b:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Repository B has no analyzed diagram versions")
    repo_b_data = json.loads(ver_b["nodes_json"])
    
    conn.close()
    
    # Call AI compare service
    result = ai_service.compare_architectures(repo_a_name, repo_a_data, repo_b_name, repo_b_data)
    
    return {
        "repo_a_name": repo_a_name,
        "repo_b_name": repo_b_name,
        "repo_a_id": repo_a_id,
        "repo_b_id": repo_b_id,
        "scores_a": repo_a_data.get("benchmarks", {}).get("scores", {}),
        "scores_b": repo_b_data.get("benchmarks", {}).get("scores", {}),
        "winner": result.get("winner", "Draw"),
        "winner_reason": result.get("winner_reason", ""),
        "report": result.get("comparison_report", "")
    }

@app.get("/api/repos/{repo_id}")
def get_repository_details(repo_id: str):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get repo
    cursor.execute("SELECT * FROM repositories WHERE id = ?", (repo_id,))
    repo = row_to_dict(cursor.fetchone())
    if not repo:
        conn.close()
        raise HTTPException(status_code=404, detail="Repository not found")
        
    # Get latest version
    cursor.execute("SELECT * FROM diagram_versions WHERE repo_id = ? ORDER BY created_at DESC LIMIT 1", (repo_id,))
    version = row_to_dict(cursor.fetchone())
    
    conn.close()
    
    # Generate mock code tree based on files inside CLONE_DIR if it exists, or provide mock tree
    local_path = os.path.join(CLONE_DIR, repo_id)
    if os.path.exists(local_path):
        parser = RepositoryParser(local_path)
        parser.scan()
        file_tree = parser.get_file_tree()
    else:
        file_tree = {"name": "root", "type": "directory", "children": []}
        
    raw_json = json.loads(version["nodes_json"]) if version else {}
    if "system_graph" in raw_json:
        diagram_data = raw_json
    else:
        old_nodes = raw_json.get("nodes", [])
        old_edges = raw_json.get("edges", [])
        old_mermaid = version["mermaid_code"] if version else ""
        diagram_data = {
            "file_graph": {
                "nodes": old_nodes,
                "edges": old_edges,
                "mermaid": old_mermaid
            },
            "system_graph": {
                "nodes": old_nodes,
                "edges": old_edges,
                "mermaid": old_mermaid
            },
            "warnings": [],
            "insights": {
                "risks": [],
                "critical_files": [],
                "bottlenecks": [],
                "refactoring": []
            },
            "node_details": {}
        }
    
    return {
        "repo": repo,
        "file_tree": file_tree,
        "diagram": diagram_data,
        "summary": version["summary_text"] if version else "",
        "commit_hash": version["commit_hash"] if version else ""
    }

@app.get("/api/repos/{repo_id}/versions")
def get_repository_versions(repo_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, commit_hash, created_at, summary_text FROM diagram_versions WHERE repo_id = ? ORDER BY created_at DESC", (repo_id,))
    versions = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()
    return versions

@app.post("/api/repos/{repo_id}/chat")
def chat_architect(repo_id: str, req: ChatRequest):
    """Answers engineering questions using code references."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get latest version for repo parsing state
    cursor.execute("SELECT * FROM diagram_versions WHERE repo_id = ? ORDER BY created_at DESC LIMIT 1", (repo_id,))
    version = row_to_dict(cursor.fetchone())
    if not version:
        conn.close()
        raise HTTPException(status_code=404, detail="No diagram version found for this repository")
        
    nodes_edges = json.loads(version["nodes_json"])
    nodes = nodes_edges.get("nodes", [])
    files_list = [n["id"] for n in nodes]
    component_types = {n["id"]: n["data"]["type"] for n in nodes}
    
    # Check or create session
    session_id = req.session_id or str(uuid.uuid4())
    cursor.execute("SELECT id FROM chat_sessions WHERE id = ?", (session_id,))
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO chat_sessions (id, repo_id, title) VALUES (?, ?, ?)",
            (session_id, repo_id, f"Chat - {req.message[:30]}...")
        )
        
    # Get Chat History
    cursor.execute("SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
    history = [{"role": r["role"], "content": r["content"]} for r in cursor.fetchall()]
    
    # Query Knowledge Graph Context (Phase 6)
    cursor.execute("SELECT id, name, type, file_path, metadata_json FROM graph_entities WHERE repo_id = ?", (repo_id,))
    entities = []
    for r in cursor.fetchall():
        entities.append({
            "id": r["id"],
            "name": r["name"],
            "type": r["type"],
            "file_path": r["file_path"],
            "metadata": json.loads(r["metadata_json"]) if r["metadata_json"] else {}
        })
    cursor.execute("SELECT source_id, target_id, type FROM graph_relations WHERE repo_id = ?", (repo_id,))
    relations = []
    for r in cursor.fetchall():
        relations.append({
            "source": r["source_id"],
            "target": r["target_id"],
            "type": r["type"]
        })
        
    # Use a fresh parser instance for graph query (no file scanning needed)
    graph_parser = RepositoryParser(".")
    graph_res = graph_parser.query_graph(req.message, entities, relations)
    graph_context = ""
    highlighted_nodes = []
    if graph_res.get("paths"):
        highlighted_nodes = graph_res["highlighted_nodes"]
        graph_context = f"Static Knowledge Graph Analysis:\nExplanation: {graph_res['explanation']}\nPaths found:\n"
        for idx, path in enumerate(graph_res["paths"]):
            path_str = " -> ".join([f"{e['source']} ({e['type']}) -> {e['target']}" for e in path])
            graph_context += f"Path #{idx+1}: {path_str}\n"
    
    logger.info(f"Chat: repo={repo_id} | q='{req.message[:60]}' | graph_hits={len(highlighted_nodes)}")

    # Call Gemini
    result = ai_service.chat_about_architecture(files_list, component_types, history, req.message, graph_context)
    
    # Merge static highlights into the response highlights
    if highlighted_nodes:
        ai_highlights = result.get("highlighted_nodes", [])
        result["highlighted_nodes"] = list(set(ai_highlights + highlighted_nodes))

    # Save user message
    user_msg_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, 'user', ?)",
        (user_msg_id, session_id, req.message)
    )
    
    # Save assistant response
    assistant_msg_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO chat_messages (id, session_id, role, content, referenced_files, highlighted_nodes) VALUES (?, ?, 'assistant', ?, ?, ?)",
        (
            assistant_msg_id,
            session_id,
            result["answer"],
            json.dumps(result.get("referenced_files", [])),
            json.dumps(result.get("highlighted_nodes", []))
        )
    )
    
    conn.commit()
    conn.close()
    
    return {
        "session_id": session_id,
        "answer": result["answer"],
        "referenced_files": result.get("referenced_files", []),
        "highlighted_nodes": result.get("highlighted_nodes", [])
    }

@app.get("/api/repos/{repo_id}/chat/sessions")
def get_chat_sessions(repo_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chat_sessions WHERE repo_id = ? ORDER BY created_at DESC", (repo_id,))
    sessions = [row_to_dict(s) for s in cursor.fetchall()]
    conn.close()
    return sessions

@app.get("/api/chat/sessions/{session_id}/messages")
def get_session_messages(session_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
    messages = []
    for r in cursor.fetchall():
        d = row_to_dict(r)
        d["referenced_files"] = json.loads(d["referenced_files"]) if d["referenced_files"] else []
        d["highlighted_nodes"] = json.loads(d["highlighted_nodes"]) if d["highlighted_nodes"] else []
        messages.append(d)
    conn.close()
    return messages

@app.post("/api/repos/{repo_id}/review")
def review_pull_request(repo_id: str, req: PRReviewRequest):
    """Simulates a PR and returns scores + architectural impact review."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Read files list to feed prompt context
    cursor.execute("SELECT * FROM diagram_versions WHERE repo_id = ? ORDER BY created_at DESC LIMIT 1", (repo_id,))
    version = row_to_dict(cursor.fetchone())
    files_list = []
    if version:
        nodes_edges = json.loads(version["nodes_json"])
        files_list = [n["id"] for n in nodes_edges.get("nodes", [])]
        
    # Formulate mock PR diff text based on branches
    pr_diff = f"""diff --git a/api/routes/users.py b/api/routes/users.py
index a27d49b..8f4fbc3 100644
--- a/api/routes/users.py
+++ b/api/routes/users.py
@@ -10,6 +10,14 @@
+from database.db_client import get_database_connection
+
 @router.get("/profile")
 def get_profile(user_id: str):
-    return services.user_profile(user_id)
+    # DIRECT INLINE QUERY INTRODUCING COUPLING AND RAW PERSISTENCE ACCESS IN ROUTER
+    db = get_database_connection()
+    user = db.execute("SELECT * FROM users WHERE id = '" + user_id + "'").fetchone()
+    return user
"""

    report, scores = ai_service.review_pr(files_list, pr_diff)
    
    review_id = str(uuid.uuid4())
    try:
        cursor.execute(
            "INSERT INTO pr_reviews (id, repo_id, pr_number, source_branch, target_branch, impact_report, score_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (review_id, repo_id, req.pr_number, req.source_branch, req.target_branch, report, json.dumps(scores))
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database saving review error: {str(e)}")
        
    conn.close()
    
    return {
        "id": review_id,
        "repo_id": repo_id,
        "pr_number": req.pr_number,
        "source_branch": req.source_branch,
        "target_branch": req.target_branch,
        "impact_report": report,
        "scores": scores
    }

@app.get("/api/repos/{repo_id}/reviews")
def get_pr_reviews(repo_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pr_reviews WHERE repo_id = ? ORDER BY created_at DESC", (repo_id,))
    reviews = []
    for r in cursor.fetchall():
        d = row_to_dict(r)
        d["scores"] = json.loads(d["score_json"])
        reviews.append(d)
    conn.close()
    return reviews

@app.post("/api/repos/{repo_id}/edit")
def edit_diagram(repo_id: str, req: EditDiagramRequest):
    """Edits the canvas nodes/edges/mermaid configurations using natural language requests."""
    result = ai_service.natural_language_edit(req.current_mermaid, req.nodes, req.edges, req.instruction)
    
    # Save the new edited diagram as a version in DB
    conn = get_db()
    cursor = conn.cursor()
    version_id = str(uuid.uuid4())
    commit_hash = f"nl-edit-{str(uuid.uuid4())[:8]}"
    
    try:
        cursor.execute(
            "INSERT INTO diagram_versions (id, repo_id, commit_hash, mermaid_code, nodes_json, summary_text) VALUES (?, ?, ?, ?, ?, ?)",
            (
                version_id, 
                repo_id, 
                commit_hash, 
                result["mermaid_code"], 
                json.dumps({"nodes": result["nodes"], "edges": result["edges"]}), 
                f"NL Edit: {result['summary']}"
            )
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database save error: {str(e)}")
    finally:
        conn.close()
        
    return {
        "mermaid": result["mermaid_code"],
        "nodes": result["nodes"],
        "edges": result["edges"],
        "summary": result["summary"],
        "commit_hash": commit_hash
    }

@app.post("/api/copilot")
def design_copilot(req: CopilotRequest):
    """Creates system architecture templates from text inputs (e.g. Uber for Boats)."""
    result = ai_service.copilot_design(req.prompt)
    
    conn = get_db()
    cursor = conn.cursor()
    copilot_id = str(uuid.uuid4())
    try:
        cursor.execute(
            "INSERT INTO copilot_designs (id, prompt, design_markdown, mermaid_code) VALUES (?, ?, ?, ?)",
            (copilot_id, req.prompt, result["design_markdown"], result["mermaid_code"])
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
    finally:
        conn.close()
        
    return {
        "id": copilot_id,
        "prompt": req.prompt,
        "design": result["design_markdown"],
        "mermaid": result["mermaid_code"]
    }

@app.get("/api/copilots")
def get_copilot_designs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM copilot_designs ORDER BY created_at DESC")
    designs = [row_to_dict(d) for d in cursor.fetchall()]
    conn.close()
    return designs

@app.get("/api/repos/{repo_id}/impact/{node_id:path}")
def check_node_impact(repo_id: str, node_id: str):
    """Traces direct and indirect dependencies of a node and calls AI to analyze breakages."""
    local_path = os.path.join(CLONE_DIR, repo_id)
    if not os.path.exists(local_path):
        raise HTTPException(status_code=404, detail="Repository checkout directory not found")
        
    parser = RepositoryParser(local_path)
    parser.scan()
    
    # Run static blast radius checks
    radius_data = parser.get_impact_radius(node_id)
    
    # Run AI analysis
    result = ai_service.analyze_impact(
        node_id, 
        radius_data["direct"], 
        radius_data["indirect"], 
        radius_data["risk_score"],
        parser.files
    )
    
    return {
        "node_id": node_id,
        "direct": radius_data["direct_labels"],
        "indirect": radius_data["indirect_labels"],
        "risk_score": result.get("risk_score", radius_data["risk_score"]),
        "risk_level": result.get("risk_level", "MEDIUM"),
        "explanation": result.get("explanation", ""),
        "breakages": result.get("breakages", []),
        "mitigation": result.get("mitigation", [])
    }

@app.post("/api/repos/{repo_id}/simulate")
def simulate_architecture_change(repo_id: str, req: SimulateRequest):
    """Predicts trade-offs, before/after systems, pros/cons, complexity/cost shifts from change prompt."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT mermaid_code FROM diagram_versions WHERE repo_id = ? ORDER BY created_at DESC LIMIT 1", (repo_id,))
    ver = cursor.fetchone()
    conn.close()
    
    current_mermaid = ver["mermaid_code"] if ver else ""
    
    result = ai_service.simulate_change(current_mermaid, req.change_prompt)
    return result

@app.get("/api/repos/{repo_id}/refactor")
def get_refactoring_roadmap(repo_id: str):
    """Triggers static parser diagnostics and AI refactoring planner."""
    local_path = os.path.join(CLONE_DIR, repo_id)
    if not os.path.exists(local_path):
        raise HTTPException(status_code=404, detail="Repository checkout directory not found")
        
    parser = RepositoryParser(local_path)
    parser.scan()
    diagram_data = parser.generate_diagram_data()
    
    result = ai_service.generate_refactoring_plan(
        parser.files, 
        parser.component_types, 
        diagram_data.get("warnings", []), 
        parser.stats
    )
    return result

@app.get("/api/repos/{repo_id}/history")
def get_architecture_history(repo_id: str):
    """Fetches metric trend lines across versions in diagram_versions."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT commit_hash, nodes_json, created_at FROM diagram_versions WHERE repo_id = ? ORDER BY created_at ASC", 
        (repo_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for r in rows:
        commit = r["commit_hash"]
        date = r["created_at"]
        
        # Load diagram_data
        try:
            diagram = json.loads(r["nodes_json"])
            bms = diagram.get("benchmarks", {})
            scores = bms.get("scores", {})
            warnings_count = len(diagram.get("warnings", []))
            
            history.append({
                "commit": commit,
                "date": date,
                "maintainability": scores.get("maintainability", 65),
                "modularity": scores.get("modularity", 70),
                "complexity": scores.get("complexity", 70),
                "warnings": warnings_count
            })
        except Exception:
            pass
            
    # If history is empty (e.g. initial demo load)
    if not history:
        history = [
            {"commit": "8f7ab2c1", "date": "2026-06-15 22:00:00", "maintainability": 65, "modularity": 70, "complexity": 70, "warnings": 3},
            {"commit": "2e4ffca1", "date": "2026-06-15 22:15:00", "maintainability": 72, "modularity": 65, "complexity": 75, "warnings": 3}
        ]
        
    return history

@app.post("/api/repos/{repo_id}/graph/query")
def run_graph_query_endpoint(repo_id: str, req: GraphQueryRequest):
    """Executes a compiler-accurate graph database query (BFS/DFS path matching)."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if repo exists
    cursor.execute("SELECT name FROM repositories WHERE id = ?", (repo_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Repository not found")
        
    # Read all entities
    cursor.execute("SELECT id, name, type, file_path, metadata_json FROM graph_entities WHERE repo_id = ?", (repo_id,))
    entities = []
    for r in cursor.fetchall():
        entities.append({
            "id": r["id"],
            "name": r["name"],
            "type": r["type"],
            "file_path": r["file_path"],
            "metadata": json.loads(r["metadata_json"]) if r["metadata_json"] else {}
        })
        
    # Read all relations
    cursor.execute("SELECT source_id, target_id, type FROM graph_relations WHERE repo_id = ?", (repo_id,))
    relations = []
    for r in cursor.fetchall():
        relations.append({
            "source": r["source_id"],
            "target": r["target_id"],
            "type": r["type"]
        })
        
    conn.close()
    
    # If no entities, fallback to extracting them from active path if it exists
    local_path = os.path.join(CLONE_DIR, repo_id)
    if not entities and os.path.exists(local_path):
        parser = RepositoryParser(local_path)
        parser.scan()
        entities, relations = parser.extract_graph_entities_and_relations()
        
    # Run graph query using a lightweight parser instance (no file scanning)
    graph_parser = RepositoryParser(".")
    result = graph_parser.query_graph(req.query_text, entities, relations)
    return result

# ==================== HELPERS ====================

def _get_latest_commit_sha(repo_path: str) -> str:
    try:
        repo = git.Repo(repo_path)
        return repo.head.commit.hexsha[:8]
    except Exception:
        return "main-branch"

def _create_mock_codebase(local_path: str, repo_name: str):
    """Creates a sample directories tree & files to populate the workspace tree for analysis."""
    # We create a beautiful multi-layer FastAPI architecture or Next.js layout depending on name
    if "react" in repo_name.lower() or "next" in repo_name.lower():
        # E-commerce React
        structure = {
            "app/page.tsx": "import React from 'react';\nimport ProductGrid from '@/components/ProductGrid';\nexport default function Home() { return <ProductGrid />; }",
            "app/layout.tsx": "export default function Layout({ children }) { return <html><body>{children}</body></html> }",
            "components/ProductGrid.tsx": "import { useProductService } from '@/services/ProductService';\nexport default function ProductGrid() { const p = useProductService(); return <div>{p.length}</div>; }",
            "components/Header.tsx": "export default function Header() { return <header>ArchAI Shop</header> }",
            "services/ProductService.ts": "export function useProductService() { return [{id: 1, name: 'AI Architect Shield'}]; }",
            "services/CartService.ts": "import { useProductService } from './ProductService';\nexport function addToCart() { console.log('added'); }",
            "models/Product.ts": "export interface Product { id: number; name: string; price: number; }",
            "docker-compose.yml": "version: '3.8'\nservices:\n  frontend:\n    build: .\n    ports:\n      - '3000:3000'",
            "Dockerfile": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"run\", \"dev\"]"
        }
    else:
        # Standard FastAPI Ecommerce Monolith (the default template)
        structure = {
            "main.py": "from fastapi import FastAPI\nfrom api.routes import users, products, orders\napp = FastAPI()\napp.include_router(users.router)\napp.include_router(products.router)\napp.include_router(orders.router)",
            "api/routes/__init__.py": "",
            "api/routes/users.py": "from fastapi import APIRouter, Depends\nfrom api.controllers.user_controller import UserController\nrouter = APIRouter()\n@router.get('/users/{id}')\ndef get_user(id: int): return UserController.get_by_id(id)",
            "api/routes/products.py": "from fastapi import APIRouter\nfrom api.controllers.product_controller import ProductController\nrouter = APIRouter()\n@router.get('/products')\ndef list_products(): return ProductController.list_all()",
            "api/routes/orders.py": "from fastapi import APIRouter\nfrom api.controllers.order_controller import OrderController\nrouter = APIRouter()\n@router.post('/orders')\ndef create_order(payload: dict): return OrderController.place_order(payload)",
            "api/controllers/user_controller.py": "from database.models import User\nclass UserController:\n    @staticmethod\n    def get_by_id(uid: int):\n        return {'id': uid, 'name': 'John Doe'}",
            "api/controllers/product_controller.py": "from api.services.inventory_service import InventoryService\nclass ProductController:\n    @staticmethod\n    def list_all():\n        return InventoryService.get_available_stock()",
            "api/controllers/order_controller.py": "from api.services.payment_service import PaymentService\nfrom database.models import Order\nclass OrderController:\n    @staticmethod\n    def place_order(payload):\n        PaymentService.charge(payload['amount'])\n        return {'status': 'success', 'order_id': 101}",
            "api/services/payment_service.py": "import stripe\nclass PaymentService:\n    @staticmethod\n    def charge(amount: float):\n        print(f'Charging {amount}')",
            "api/services/inventory_service.py": "class InventoryService:\n    @staticmethod\n    def get_available_stock():\n        return [{'name': 'AI Software Architect License', 'quantity': 10}]",
            "database/connection.py": "import sqlite3\ndef connect_db(): return sqlite3.connect('app.db')",
            "database/models.py": "class User: id: int; name: str\nclass Order: id: int; amount: float; status: str",
            "Dockerfile": "FROM python:3.10-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\"]"
        }
        
    for rel_path, content in structure.items():
        full_p = os.path.join(local_path, rel_path)
        os.makedirs(os.path.dirname(full_p), exist_ok=True)
        with open(full_p, "w") as f:
            f.write(content)
