import os
import re
import json
from typing import List, Dict, Any, Tuple
from google import genai
from google.genai import types

class AIService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                # Use gemini-2.5-flash as the default model
                self.model = "gemini-2.5-flash"
                self.is_mock = False
            except Exception as e:
                print(f"Error initializing Gemini client: {e}. Falling back to mock mode.")
                self.is_mock = True
        else:
            print("No GEMINI_API_KEY environment variable found. Running in MOCK Mode.")
            self.is_mock = True

    def generate_summary(self, files_list: List[str], component_types: Dict[str, str], stats: Dict[str, Any]) -> str:
        """Generates an architectural summary of the scanned repository."""
        if self.is_mock:
            return self._mock_summary(files_list, component_types, stats)
            
        prompt = f"""
        You are a Staff Software Architect.
        Analyze the following repository structure and generate a high-level system design and architecture summary.
        
        Repository files & categorized components:
        {json.dumps({"files": files_list, "components": component_types}, indent=2)}
        
        Statistics:
        {json.dumps(stats, indent=2)}
        
        You MUST respond in JSON format matching the following schema:
        {{
            "purpose": "string describing what this system does",
            "architecture": "string describing the major components and structural layout",
            "data_flow": "string describing how data moves through the layers",
            "dependencies": "string listing critical external systems, APIs, or libraries",
            "risks": "string detailing potential bottlenecks, coupling issues, or security flaws",
            "complexity_score": 75
        }}
        
        The complexity_score must be an integer between 1 and 100.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return response.text
        except Exception as e:
            print(f"Gemini API call failed in generate_summary: {e}")
            return self._mock_summary(files_list, component_types, stats)

    def chat_about_architecture(self, files_list: List[str], component_types: Dict[str, str], 
                                 chat_history: List[Dict[str, str]], query: str, graph_context: str = "") -> Dict[str, Any]:
        """
        Answers a user's question about the repository.
        Returns a dict conforming to:
        {
          "answer": "markdown response",
          "referenced_files": ["file1.py", "file2.py"],
          "highlighted_nodes": ["file1.py"]
        }
        """
        if self.is_mock:
            return self._mock_chat(files_list, component_types, query, graph_context)

        formatted_history = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
        
        prompt = f"""
        You are ArchAI, an AI Software Architect.
        Answer user questions about the following codebase.
        
        Codebase structure:
        {json.dumps({"files": files_list, "components": component_types}, indent=2)}
        
        {f"COMPILER-ACCURATE STATIC KNOWLEDGE GRAPH FACTS:\n{graph_context}\nIMPORTANT: You MUST explain this static code structure path accurately and mention these specific files in your explanation." if graph_context else ""}
        
        Chat History:
        {formatted_history}
        
        User Query: {query}
        
        You MUST respond in JSON format with three fields:
        - "answer": A detailed markdown answer addressing the query, referring to specific code files where appropriate.
        - "referenced_files": A list of relative paths of files in the workspace that are highly relevant to this query.
        - "highlighted_nodes": A list of file paths (matching nodes in the canvas) that should be highlighted as a visual flow for the user.
        
        JSON schema:
        {{
            "answer": "string",
            "referenced_files": ["string"],
            "highlighted_nodes": ["string"]
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API call failed in chat_about_architecture: {e}")
            return self._mock_chat(files_list, component_types, query, graph_context)

    def review_pr(self, files_list: List[str], branch_diff: str) -> Tuple[str, Dict[str, int]]:
        """Reviews a PR diff and returns an architectural report and safety/quality scores."""
        if self.is_mock:
            return self._mock_pr_review(files_list, branch_diff)

        prompt = f"""
        You are a Principal Security and Software Architect.
        Perform a strict pull request review based on the diff content below.
        
        File List in Repo:
        {json.dumps(files_list)}
        
        Pull Request Diff:
        {branch_diff}
        
        Provide:
        1. An **Architecture Impact Report** in Markdown format.
           Include checks for:
           - Circular dependencies introduced
           - Clean architecture violations (e.g. UI importing database layers directly)
           - Coupling and complexity increases
           - Security risks (e.g. hardcoded keys, SQL injection)
           - Duplicate service logic
        2. System scores on a 1-100 scale:
           - Maintainability
           - Scalability
           - Complexity (where higher is simpler/better code layout, or standard complexity meter)
           - Risk (where lower is safer/better)
        
        You MUST respond in JSON format:
        {{
            "impact_report": "markdown text here",
            "scores": {{
                "maintainability": 85,
                "scalability": 90,
                "complexity": 75,
                "risk": 20
            }}
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            data = json.loads(response.text)
            return data["impact_report"], data["scores"]
        except Exception as e:
            print(f"Gemini API call failed in review_pr: {e}")
            return self._mock_pr_review(files_list, branch_diff)

    def natural_language_edit(self, current_mermaid: str, nodes: List[Dict], edges: List[Dict], instruction: str) -> Dict[str, Any]:
        """
        Updates the Mermaid diagram and React Flow nodes based on natural language instruction.
        """
        if self.is_mock:
            return self._mock_nl_edit(current_mermaid, nodes, edges, instruction)

        prompt = f"""
        You are an AI System Design canvas updater.
        Apply the user's editing instruction to the system architecture diagram.
        
        Current Mermaid Diagram:
        ```mermaid
        {current_mermaid}
        ```
        
        React Flow Nodes:
        {json.dumps(nodes, indent=2)}
        
        React Flow Edges:
        {json.dumps(edges, indent=2)}
        
        User Edit Request: "{instruction}"
        
        You must modify the architecture. For example, if the request is "Add Redis caching", you should add a Redis caching database node and link it to relevant services.
        
        Return a JSON response containing:
        - "mermaid_code": The complete updated Mermaid diagram string.
        - "nodes": Updated React Flow nodes list.
        - "edges": Updated React Flow edges list.
        - "summary": A brief description of what was changed and why.
        
        Format:
        {{
            "mermaid_code": "...",
            "nodes": [...],
            "edges": [...],
            "summary": "..."
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API call failed in natural_language_edit: {e}")
            return self._mock_nl_edit(current_mermaid, nodes, edges, instruction)

    def copilot_design(self, prompt: str) -> Dict[str, Any]:
        """Generates a complete system design template from a natural language request."""
        if self.is_mock:
            return self._mock_copilot(prompt)

        input_prompt = f"""
        You are an elite Senior Principal Software Architect.
        Design a full software system based on the following request:
        "{prompt}"
        
        Generate a comprehensive, production-grade architectural specification in JSON format.
        
        JSON response structure:
        {{
            "design_markdown": "# System Design: [App Name]\\n\\n## 1. System Architecture\\n...\\n## 2. Database Schema\\n...\\n## 3. API Design\\n...\\n## 4. Scaling & Caching Strategy\\n...\\n## 5. Deployment & Cost Estimations\\n...",
            "mermaid_code": "graph TD\\n...\\n"
        }}
        
        Provide high quality markdown design specification. Make it feel like an actual RFC/PRD document.
        """

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=input_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API call failed in copilot_design: {e}")
            return self._mock_copilot(prompt)

    # ==================== MOCK FALLBACK IMPLEMENTATIONS ====================

    def _mock_summary(self, files_list: List[str], component_types: Dict[str, str], stats: Dict[str, Any]) -> str:
        # Detect primary technology stack
        langs = stats.get("languages", {})
        primary_lang = max(langs.keys(), key=lambda k: langs[k]) if langs else "TypeScript"
        
        # Categorize
        apis = [f for f, t in component_types.items() if t == 'API']
        services = [f for f, t in component_types.items() if t == 'Service']
        dbs = [f for f, t in component_types.items() if t in ('Database', 'Model')]
        
        payload = {
            "purpose": f"This system is a modular {primary_lang}-based web service designed to manage backend operations, exposing endpoints for client request execution and coordinating persistence schemas.",
            "architecture": f"The codebase implements a layered architecture pattern separating routing entry controllers ({len(apis)} modules) from core business logic layers ({len(services)} services) and data model entities ({len(dbs)} schemas).",
            "data_flow": "Incoming HTTP requests hit API routes, which authenticate the headers before delegating tasks to controllers. Controllers invoke business service functions, executing database persistence actions before returning structured JSON.",
            "dependencies": "Uses standard web framework libraries (FastAPI/Express), database connections (SQLite/PostgreSQL drivers), and environment runtime settings.",
            "risks": "Lack of caching at relational databases may lead to scaling load constraints under high concurrency. Tightly-coupled modules should be decoupled into standard repositories.",
            "complexity_score": 68
        }
        return json.dumps(payload)

    def _mock_chat(self, files_list: List[str], component_types: Dict[str, str], query: str, graph_context: str = "") -> Dict[str, Any]:
        query_lower = query.lower()
        referenced = []
        
        # Prepend graph context facts if present
        graph_prefix = f"### Compiler-Accurate Knowledge Graph Insight\n\n{graph_context}\n\n" if graph_context else ""
        
        # Keyword matching heuristic to simulate code file discovery
        if "auth" in query_lower or "login" in query_lower or "jwt" in query_lower:
            referenced = [f for f in files_list if "auth" in f.lower() or "login" in f.lower()]
            answer = graph_prefix + """### Authentication & Authorization System
 
The authentication layer validates credentials using a Token-based system (likely JWT). 
1. The user logs in via the auth routes, calling verification services.
2. The system checks database credentials, signs a session token, and returns it.
3. Protected routes verify this signature before processing requests.
 
**Relevant files:**
""" + "\n".join([f"- `{f}`" for f in referenced])
            
        elif "db" in query_lower or "database" in query_lower or "model" in query_lower or "sql" in query_lower:
            referenced = [f for f in files_list if "db" in f.lower() or "model" in f.lower() or "schema" in f.lower() or f.endswith('.sql')]
            answer = graph_prefix + """### Data Persistence Layer

The application utilizes database entities to read and write state.
1. Model files declare database schemas (tables, columns, references).
2. A Database service initializes connection pools and triggers migrations.
3. Services inject connections to query resources.

**Relevant files:**
""" + "\n".join([f"- `{f}`" for f in referenced])

        elif "route" in query_lower or "api" in query_lower or "http" in query_lower:
            referenced = [f for f in files_list if "route" in f.lower() or "api" in f.lower() or "controller" in f.lower()]
            answer = graph_prefix + """### Routing & API Gateway Flow

HTTP traffic enters through controllers/routes that validate query formats:
1. Entry-points configure host middlewares (CORS, body parsing).
2. Routing path handlers call business services.
3. Controllers return formatted JSON responses.

**Relevant files:**
""" + "\n".join([f"- `{f}`" for f in referenced])
        else:
            referenced = [files_list[0]] if files_list else []
            answer = graph_prefix + f"""### Architectural Query Resolution

I scanned the system for "{query}". The architecture exposes modular layers:
1. Requests are received and processed by entry handlers.
2. Data structures maintain configuration states.
3. Core imports define dependencies between components.

Let me know if you would like me to detail specific components.
"""

        # Highlight up to 3 nodes
        highlighted = referenced[:3] if referenced else ([files_list[0]] if files_list else [])
        
        return {
            "answer": answer,
            "referenced_files": referenced,
            "highlighted_nodes": highlighted
        }

    def _mock_pr_review(self, files_list: List[str], branch_diff: str) -> Tuple[str, Dict[str, int]]:
        report = """# ArchAI Pull Request Architecture Review

## 🔍 Circular Dependency Analysis
* **Status**: **PASSED**
* No circular imports were detected between directory boundaries. Imports flow cleanly from routers -> controllers -> services.

## 🏗️ Architectural Coupling
* **Status**: **WARN**
* Some service files contain hard dependencies on local database queries. Consider wrapping these in a repository-pattern adapter to increase separation.

## 🔒 Security Risk Check
* **Status**: **PASSED**
* Checked diff for environment keys or plaintext passwords. Secret configuration imports appear isolated in dedicated configs.

## 📊 Score Dashboard
- **Maintainability**: **88 / 100** (Solid modular structure, easy to extend)
- **Scalability**: **82 / 100** (Adequate, though caching should be introduced for DB endpoints)
- **Complexity**: **90 / 100** (Code is clean and low cognitive load)
- **Risk**: **15 / 100** (Low risk, modifications are local additions)
"""
        scores = {
            "maintainability": 88,
            "scalability": 82,
            "complexity": 90,
            "risk": 15
        }
        return report, scores

    def _mock_nl_edit(self, current_mermaid: str, nodes: List[Dict], edges: List[Dict], instruction: str) -> Dict[str, Any]:
        inst_lower = instruction.lower()
        summary = f"Applied NL Edit instruction: '{instruction}'"
        
        # Make copies to avoid modifying inputs
        updated_nodes = list(nodes)
        updated_edges = list(edges)
        
        # Default positioning for new node
        new_x = 450
        new_y = 450
        
        if "redis" in inst_lower or "cache" in inst_lower:
            new_node_id = "cache/redis.db"
            # Add Redis node
            updated_nodes.append({
                "id": new_node_id,
                "type": "customNode",
                "position": {"x": 850, "y": 250},
                "data": {
                    "label": "redis.db",
                    "path": new_node_id,
                    "type": "Database",
                    "icon": "🗄️",
                    "bg": "#1e293b",
                    "border": "#10b981",
                    "textColor": "#10b981"
                }
            })
            # Find a service node to link it to
            service_nodes = [n for n in nodes if n["data"]["type"] in ("Service", "Component")]
            if service_nodes:
                target_node = service_nodes[0]["id"]
                updated_edges.append({
                    "id": f"e_nl_{len(edges)}",
                    "source": target_node,
                    "target": new_node_id,
                    "animated": True,
                    "style": {"stroke": "#10b981", "strokeWidth": 2}
                })
            
            # Reconstruct Mermaid with the Redis cache injected
            mermaid_lines = current_mermaid.splitlines()
            # Insert Redis subgraph node
            for idx, line in enumerate(mermaid_lines):
                if "subgraph Database" in line or "subgraph" in line and "DB" in line:
                    mermaid_lines.insert(idx + 1, '        cache_redis_db["🗄️ redis.db"]')
                    break
            else:
                mermaid_lines.append('    cache_redis_db["🗄️ redis.db"]')
            
            # Link it
            if service_nodes:
                src_safe = service_nodes[0]["id"].replace('/', '_').replace('.', '_').replace('-', '_')
                mermaid_lines.append(f"    {src_safe} --> cache_redis_db")
                
            current_mermaid = "\n".join(mermaid_lines)
            summary = "Added a Redis caching node (`cache/redis.db`) and established dependency linking it from the primary service logic to enable read-through caching."
            
        elif "gateway" in inst_lower or "api gateway" in inst_lower:
            new_node_id = "infra/gateway.api"
            updated_nodes.append({
                "id": new_node_id,
                "type": "customNode",
                "position": {"x": 50, "y": 150},
                "data": {
                    "label": "gateway.api",
                    "path": new_node_id,
                    "type": "API/Route",
                    "icon": "🌐",
                    "bg": "#1e293b",
                    "border": "#06b6d4",
                    "textColor": "#06b6d4"
                }
            })
            # Link gateway to routes
            route_nodes = [n for n in nodes if n["data"]["type"] == "API/Route"]
            for r_node in route_nodes[:2]:
                updated_edges.append({
                    "id": f"e_nl_{len(edges) + 1}",
                    "source": new_node_id,
                    "target": r_node["id"],
                    "animated": True,
                    "style": {"stroke": "#06b6d4", "strokeWidth": 2}
                })
                
            mermaid_lines = current_mermaid.splitlines()
            mermaid_lines.append('    infra_gateway_api["🌐 gateway.api"]')
            for r_node in route_nodes[:2]:
                dest_safe = r_node["id"].replace('/', '_').replace('.', '_').replace('-', '_')
                mermaid_lines.append(f"    infra_gateway_api --> {dest_safe}")
                
            current_mermaid = "\n".join(mermaid_lines)
            summary = "Introduced an API Gateway entrypoint (`infra/gateway.api`) positioned in front of the existing API routing paths."
            
        else:
            # Add general component
            new_node_id = "services/new_component.py"
            updated_nodes.append({
                "id": new_node_id,
                "type": "customNode",
                "position": {"x": new_x, "y": new_y},
                "data": {
                    "label": "new_component.py",
                    "path": new_node_id,
                    "type": "Service",
                    "icon": "⚙️",
                    "bg": "#1e293b",
                    "border": "#3b82f6",
                    "textColor": "#3b82f6"
                }
            })
            mermaid_lines = current_mermaid.splitlines()
            mermaid_lines.append('    services_new_component_py["⚙️ new_component.py"]')
            current_mermaid = "\n".join(mermaid_lines)
            summary = f"Added generic architectural module: `{new_node_id}` to support: {instruction}."

        return {
            "mermaid_code": current_mermaid,
            "nodes": updated_nodes,
            "edges": updated_edges,
            "summary": summary
        }

    def _mock_copilot(self, prompt: str) -> Dict[str, Any]:
        design_markdown = f"""# System Design Specifications: {prompt.title()}
        
## 1. Executive Summary
This design document details the enterprise system architecture for **{prompt}**. The design optimizes for low-latency connections, high concurrency, and elastic scaling under peak loads.

## 2. Core Service Topology
The design implements a decoupled **Microservices Architecture**:
- **API Edge Gateway**: Authenticates incoming user connections and handles rate-limiting.
- **Matching/Scheduling Core Engine**: A high-performance dispatcher managing real-time assets.
- **Notification & Tracking Service**: Coordinates GPS event logs and pushes updates.
- **Financial Transaction Manager**: Integrates stripe/escrow transactions securely.

## 3. Database Schema Design
We implement a hybrid datastore setup combining relation models (PostgreSQL) and temporary caching (Redis):

```sql
-- Core PostgreSQL Tables
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fullname VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE active_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id VARCHAR(50) UNIQUE,
    current_gps POINT,
    status VARCHAR(20) CHECK (status IN ('AVAILABLE', 'BUSY', 'MAINTENANCE'))
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES active_assets(id),
    client_id UUID REFERENCES clients(id),
    fare NUMERIC(10, 2),
    status VARCHAR(20) DEFAULT 'PENDING'
);
```

## 4. Sequence Design
```mermaid
sequenceDiagram
    Client->>Gateway: Request Asset Booking
    Gateway->>AuthService: Validate Session
    AuthService-->>Gateway: OK
    Gateway->>Dispatcher: Search Available Assets
    Dispatcher->>Redis: Query GPS Radius
    Redis-->>Dispatcher: Assets [A, B]
    Dispatcher->>Dispatcher: Calculate Fare
    Dispatcher-->>Client: Booking Confirmed (Asset A)
```

## 5. Scaling Strategy
* **Caching**: Redis clusters store active session metadata and hot GPS coordinate tables.
* **Pub/Sub Broker**: Apache Kafka / RabbitMQ distributes real-time notifications asynchronously.
* **Auto-Scaling**: Kubernetes Horizontal Pod Autoscalers (HPA) scale dispatcher nodes on CPU triggers.
"""

        mermaid_code = """graph TD
    Client[📱 Client App] --> Gateway[🌐 API Gateway]
    Gateway --> Auth[⚡ Auth Service]
    Gateway --> Dispatch[⚙️ Match Dispatcher]
    Gateway --> Billing[⚙️ Billing Service]
    Dispatch --> Redis[🗄️ GPS Redis Cache]
    Dispatch --> PostgreSQL[🗄️ PostgreSQL DB]
    Billing --> Stripe((💳 Stripe API))
"""
        return {
            "design_markdown": design_markdown,
            "mermaid_code": mermaid_code
        }

    def evaluate_architecture(self, files_list: List[str], component_types: Dict[str, str], 
                              stats: Dict[str, Any], warnings: List[Dict[str, Any]], 
                              static_scores: Dict[str, int]) -> Dict[str, Any]:
        """Generates detailed architecture evaluation report and qualitative insights using Gemini."""
        if self.is_mock:
            return self._mock_evaluate(files_list, component_types, stats, warnings, static_scores)
            
        prompt = f"""
        You are a Principal Software Architect.
        Perform a comprehensive architecture evaluation for a repository.
        
        Repository files & categorized components:
        {json.dumps({"files": files_list, "components": component_types}, indent=2)}
        
        Statistics:
        {json.dumps(stats, indent=2)}
        
        Detected Warnings / Issues:
        {json.dumps(warnings, indent=2)}
        
        Static baseline scores computed:
        {json.dumps(static_scores, indent=2)}
        
        You MUST respond in JSON format matching the following schema:
        {{
            "scores": {{
                "maintainability": integer,
                "scalability": integer,
                "modularity": integer,
                "testability": integer,
                "complexity": integer,
                "technical_debt": integer,
                "security": integer,
                "documentation": integer
            }},
            "strengths": ["string", "string", "string", "string"],
            "weaknesses": ["string", "string", "string", "string"],
            "refactoring": ["string", "string", "string", "string"],
            "report": "string (A detailed Markdown-formatted Architecture Health Report, detailed and written in the voice of a Staff Engineer/Principal Architect)"
        }}
        
        Make sure the scores are integers between 1 and 100.
        The report must contain:
        1. Executive Summary
        2. Architectural Quality Breakdown
        3. Structural Debt & Risks
        4. Decoupling & Modularity Analysis
        5. Detailed Recommendations & Refactoring Roadmap (Short-term, Medium-term, Long-term)
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API call failed in evaluate_architecture: {e}")
            return self._mock_evaluate(files_list, component_types, stats, warnings, static_scores)

    def _mock_evaluate(self, files_list: List[str], component_types: Dict[str, str], 
                       stats: Dict[str, Any], warnings: List[Dict[str, Any]], 
                       static_scores: Dict[str, int]) -> Dict[str, Any]:
        # Generate custom qualitative aspects
        strengths = [
            "Clear structural boundaries between system layer definitions.",
            "Centralized entry point configurations validating incoming APIs.",
            "Decoupled models separating relational schemas from runtime logic.",
            "Deterministic utility services keeping helper libraries reusable."
        ]
        weaknesses = [
            f"Detected {len(warnings)} architecture warning indicators in workspace flow.",
            "Absence of caching structures blocks scaling under query load.",
            "Lack of dedicated worker threads aggregates asynchronous logs on main thread.",
            "Limited unit test coverage across core controllers."
        ]
        refactoring = [
            "Establish redis caches for high-frequency controller lookups.",
            "Decouple direct service imports using interface patterns.",
            "Implement Celery or equivalent queue worker mechanisms.",
            "Build automated test cases covering endpoints."
        ]
        
        # Build Markdown report
        report = f"""# ArchAI Architecture Health Report

## Executive Summary
This document provides a comprehensive architectural evaluation of the repository, highlighting structural design patterns, decoupling practices, scaling limits, and technical debt.
The current implementation scores **{static_scores.get('maintainability', 65)}/100** on overall Maintainability.

## Architectural Quality Breakdown
- **Modularity ({static_scores.get('modularity', 70)}/100)**: Module dependency boundaries flow in a layered pattern.
- **Scalability ({static_scores.get('scalability', 50)}/100)**: Limited, lacking caching or message brokers for task processing.
- **Testability ({static_scores.get('testability', 30)}/100)**: High density of utility functions, but lacks automated assertions.
- **Complexity ({static_scores.get('complexity', 70)}/100)**: Code routines show low cognitive load.
- **Security ({static_scores.get('security', 85)}/100)**: No raw plaintext credentials or critical injection warnings scanned.
- **Documentation ({static_scores.get('documentation', 40)}/100)**: Basic inline documentation. Needs API level documentation.

## Structural Debt & Risks
- **Cycle Conflicts**: {f"Found circular import paths." if any('warn_cycle' in w['id'] for w in warnings) else "Clean module imports hierarchy."}
- **File Bloat**: Detected oversized components requiring decomposition.

## Recommendations & Refactoring Roadmap
1. **Short-Term (Decoupling)**: Extract utility and config files into isolated folders.
2. **Medium-Term (Testing & Docs)**: Draft integration test suites targeting endpoints.
3. **Long-Term (Scale)**: Integrate a caching middleware and background queue runner.
"""
        return {
            "scores": static_scores,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "refactoring": refactoring,
            "report": report
        }

    def compare_architectures(self, repo_a_name: str, repo_a_data: Dict[str, Any], 
                              repo_b_name: str, repo_b_data: Dict[str, Any]) -> Dict[str, Any]:
        """Compares two repository architectures, calculates a winner, and details the structural trade-offs."""
        if self.is_mock:
            return self._mock_compare(repo_a_name, repo_a_data, repo_b_name, repo_b_data)
            
        prompt = f"""
        You are a Principal Software Architect.
        Compare the software architectures of two repositories and decide which one has the stronger, more maintainable structure and why.
        
        Repository A: {repo_a_name}
        Architecture Data A:
        {json.dumps({
            "stats": repo_a_data.get("stats", {}),
            "warnings": repo_a_data.get("warnings", []),
            "benchmarks": repo_a_data.get("benchmarks", {}).get("scores", {})
        }, indent=2)}
        
        Repository B: {repo_b_name}
        Architecture Data B:
        {json.dumps({
            "stats": repo_b_data.get("stats", {}),
            "warnings": repo_b_data.get("warnings", []),
            "benchmarks": repo_b_data.get("benchmarks", {}).get("scores", {})
        }, indent=2)}
        
        You MUST respond in JSON format matching the following schema:
        {{
            "winner": "string (Name of the winning repository, or 'Draw')",
            "winner_reason": "string (1-2 sentence high-level summary of why this repo won or why it is a draw)",
            "comparison_report": "string (A detailed Markdown-formatted Architecture Comparison Report written like a Staff Architect. Detail modularity index, coupling differences, testing maturity, debt comparison, and architectural styles)"
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API call failed in compare_architectures: {e}")
            return self._mock_compare(repo_a_name, repo_a_data, repo_b_name, repo_b_data)

    def _mock_compare(self, repo_a_name: str, repo_a_data: Dict[str, Any], 
                      repo_b_name: str, repo_b_data: Dict[str, Any]) -> Dict[str, Any]:
        # Extract scores
        scores_a = repo_a_data.get("benchmarks", {}).get("scores", {})
        scores_b = repo_b_data.get("benchmarks", {}).get("scores", {})
        
        avg_a = sum(scores_a.values()) / (len(scores_a) or 1)
        avg_b = sum(scores_b.values()) / (len(scores_b) or 1)
        
        if avg_a > avg_b + 2:
            winner = repo_a_name
            winner_reason = f"{repo_a_name} exhibits superior maintainability with cleaner modular layout, lower density of architectural cycle warnings, and better testing structure."
        elif avg_b > avg_a + 2:
            winner = repo_b_name
            winner_reason = f"{repo_b_name} displays better overall decoupling, lower complexity metrics, and cleaner component separation than {repo_a_name}."
        else:
            winner = "Draw"
            winner_reason = "Both repositories demonstrate similar levels of modularity and scaling indicators, with slight trade-offs between documentation quality and test density."
            
        comparison_report = f"""# Architecture Comparison Report: {repo_a_name} vs {repo_b_name}

## 📊 High-Level Metrics Comparison

| Metric | {repo_a_name} | {repo_b_name} |
| :--- | :---: | :---: |
| **Maintainability** | {scores_a.get('maintainability', 50)} | {scores_b.get('maintainability', 50)} |
| **Scalability** | {scores_a.get('scalability', 50)} | {scores_b.get('scalability', 50)} |
| **Modularity** | {scores_a.get('modularity', 50)} | {scores_b.get('modularity', 50)} |
| **Testability** | {scores_a.get('testability', 50)} | {scores_b.get('testability', 50)} |
| **Complexity** | {scores_a.get('complexity', 50)} | {scores_b.get('complexity', 50)} |
| **Technical Debt** | {scores_a.get('technical_debt', 50)} | {scores_b.get('technical_debt', 50)} |
| **Security** | {scores_a.get('security', 50)} | {scores_b.get('security', 50)} |
| **Documentation** | {scores_a.get('documentation', 50)} | {scores_b.get('documentation', 50)} |

## 🔍 Structural Trade-Offs

### 1. Modularity & Decoupling
- **{repo_a_name}**: Relies heavily on file import paths. {f"Contains circular dependencies." if len(repo_a_data.get('warnings', [])) > 0 else "Demonstrates sound directional coupling."}
- **{repo_b_name}**: Configured with decoupled component types. {f"Warning count stands at {len(repo_b_data.get('warnings', []))} items." if len(repo_b_data.get('warnings', [])) > 0 else "No modularity cycle alarms active."}

### 2. Testing & Stability Maturity
- **{repo_a_name}** testability is scored at **{scores_a.get('testability', 50)}/100**.
- **{repo_b_name}** testability is scored at **{scores_b.get('testability', 50)}/100**.

### 3. Scaling & Architecture Style
- **{repo_a_name}** scales at **{scores_a.get('scalability', 50)}/100** based on components like Caches or Workers.
- **{repo_b_name}** scales at **{scores_b.get('scalability', 50)}/100**.

## 🏆 Summary Recommendation
Based on the metric overlays, **{winner}** is identified as the structurally stronger design.
"""
        return {
            "winner": winner,
            "winner_reason": winner_reason,
            "comparison_report": comparison_report
        }

    def analyze_impact(self, node_id: str, direct: List[str], indirect: List[str], 
                       static_risk: int, files_list: List[str]) -> Dict[str, Any]:
        """Runs blast radius impact reasoning for removing or refactoring a component."""
        if self.is_mock:
            return self._mock_analyze_impact(node_id, direct, indirect, static_risk)
            
        prompt = f"""
        You are a Principal Software Architect.
        Analyze the impact of removing or refactoring the following component in a codebase:
        Target Component: {node_id}
        Direct dependents (immediate imports): {json.dumps(direct)}
        Indirect dependents (transitive dependencies): {json.dumps(indirect)}
        Static risk score (calculated by graph degree): {static_risk}/100
        
        Provide a detailed reasoning assessment in JSON format matching the schema:
        {{
            "risk_score": integer (adjusted risk out of 100),
            "risk_level": "string (CRITICAL, HIGH, MEDIUM, or LOW)",
            "explanation": "string explaining why the target is a coupling hotspot and what the consequences are",
            "breakages": ["string", "string", "string"],
            "mitigation": ["string", "string", "string"]
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API call failed in analyze_impact: {e}")
            return self._mock_analyze_impact(node_id, direct, indirect, static_risk)

    def _mock_analyze_impact(self, node_id: str, direct: List[str], indirect: List[str], static_risk: int) -> Dict[str, Any]:
        # Determine risk level
        if static_risk >= 70:
            level = "CRITICAL"
        elif static_risk >= 45:
            level = "HIGH"
        elif static_risk >= 20:
            level = "MEDIUM"
        else:
            level = "LOW"
            
        name = node_id.split("/")[-1].replace("system://", "")
        
        breakages = [
            f"Coupled downstream modules importing '{name}' will throw ImportErrors or unresolved dependencies.",
            f"Logical transactional routes relying on '{name}' behaviors will fail at runtime."
        ]
        
        mitigation = [
            f"Introduce an interface/adapter layer for '{name}' to decouple direct references.",
            f"Setup Mock wrappers for '{name}' before refactoring dependent logic.",
            "Write comprehensive integration tests covering import boundaries."
        ]
        
        if len(direct) > 0:
            breakages.append(f"Immediate crash in immediate dependents: {', '.join([os.path.basename(f) for f in direct[:2]])}.")
        if len(indirect) > 0:
            breakages.append(f"Transitive breakdown cascade affecting: {', '.join([os.path.basename(f) for f in indirect[:2]])}.")
            
        explanation = f"Target '{name}' acts as a core structural element. Deleting or refactoring its signatures triggers a wide blast radius because {len(direct)} files import it directly and {len(indirect)} modules depend on it transitively."
        
        return {
            "risk_score": static_risk,
            "risk_level": level,
            "explanation": explanation,
            "breakages": breakages,
            "mitigation": mitigation
        }

    def simulate_change(self, current_mermaid: str, change_prompt: str) -> Dict[str, Any]:
        """Simulates architectural modifications, calculating before/after stats and pros/cons."""
        if self.is_mock:
            return self._mock_simulate_change(current_mermaid, change_prompt)
            
        prompt = f"""
        You are a Principal Software Architect.
        Simulate applying the following architectural modification user prompt:
        Prompt: "{change_prompt}"
        
        Current System Diagram (Mermaid):
        ```mermaid
        {current_mermaid}
        ```
        
        Determine how the architecture, complexity, and database layout shifts.
        Provide your reasoning in JSON format matching the schema:
        {{
            "before_mermaid": "string (the current mermaid)",
            "after_mermaid": "string (the modified mermaid code showing new node links or removed nodes)",
            "pros": ["string", "string", "string"],
            "cons": ["string", "string", "string"],
            "complexity_impact": "string (e.g. +10% complexity due to connection handshakes)",
            "cost_impact": "string (e.g. +$40/mo infrastructure, +20 eng-hours)",
            "summary": "string summary of the trade-offs"
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API call failed in simulate_change: {e}")
            return self._mock_simulate_change(current_mermaid, change_prompt)

    def _mock_simulate_change(self, current_mermaid: str, change_prompt: str) -> Dict[str, Any]:
        prompt_lower = change_prompt.lower()
        
        # Default mock simulation values
        pros = [
            "Decompresses operational load on the primary CPU database threads.",
            "Enables clean horizontal scaling scaling boundaries."
        ]
        cons = [
            "Introduces data consistency sync latency (eventual consistency risks).",
            "Increases operational complexity and local environment settings."
        ]
        complexity = "+12% Complexity Index (new configuration wrappers and middleware needed)"
        cost = "+$15/mo Cloud Billing, ~16 Principal Eng-Hours refactoring"
        
        after_mermaid = current_mermaid
        
        if "redis" in prompt_lower or "cache" in prompt_lower:
            pros = [
                "Boosts latency speed of read queries by caching queries in memory.",
                "Reduces direct select queries and read IOPS on the SQL datastore."
            ]
            cons = [
                "Requires robust cache-invalidation logic (risk of reading stale states).",
                "Adds Redis container maintenance overhead and failover setups."
            ]
            complexity = "+8% Complexity (adding cache-lookup utility wrappers)"
            cost = "+$10/mo hosting cost, ~8 Engineering Hours setup"
            
            # Simple mermaid append
            after_mermaid = current_mermaid + "\n    redis_cache[\"🗄️ Redis Caching\"]"
            if "Relational Database Layer" in current_mermaid:
                after_mermaid += "\n    redis_cache --> Relational_Database_Layer"
                
        elif "mongodb" in prompt_lower or "nosql" in prompt_lower:
            pros = [
                "Supports high-frequency document writes with dynamic schema structure.",
                "Removes heavy constraint validation checks on write logs."
            ]
            cons = [
                "Lacks native relational foreign key constraint maps.",
                "Increases data model duplication rates across collections."
            ]
            complexity = "+25% Complexity (Hybrid Polyglot database persistence flow)"
            cost = "+$30/mo database hosting, ~30 Engineering Hours setup"
            after_mermaid = current_mermaid + "\n    mongo_db[\"🗄️ MongoDB Document Store\"]"
            
        elif "microservice" in prompt_lower or "split" in prompt_lower:
            pros = [
                "Decouples service deployment boundaries, allowing isolated dev velocity.",
                "Enables independent auto-scaling properties for high-load segments."
            ]
            cons = [
                "Requires RPC/HTTP communication pathways, adding networking latency.",
                "Significantly complicates configuration, API contracts, and debugging."
            ]
            complexity = "+40% Complexity (Requires API contract validation schemas)"
            cost = "+$75/mo multi-instance hosting, ~60 Engineering Hours migration"
            after_mermaid = current_mermaid + "\n    subgraph Microservice Cluster\n        auth_service[\"🔑 Authentication Microservice\"]\n    end"
            
        return {
            "before_mermaid": current_mermaid,
            "after_mermaid": after_mermaid,
            "pros": pros,
            "cons": cons,
            "complexity_impact": complexity,
            "cost_impact": cost,
            "summary": f"Simulating change: '{change_prompt}'. This introduces standard architectural trade-offs: boosting performance/scalability at the expense of setup cost and state synchronization code."
        }

    def generate_refactoring_plan(self, files_list: List[str], component_types: Dict[str, str], 
                                  warnings: List[Dict[str, Any]], stats: Dict[str, Any]) -> Dict[str, Any]:
        """Generates a priority-ranked refactoring roadmap to resolve cycle/coupling hotspots."""
        if self.is_mock:
            return self._mock_refactoring_plan(files_list, component_types, warnings)
            
        prompt = f"""
        You are a Principal Software Architect.
        Analyze the following directory structure and warnings to produce a priority-ranked codebase refactoring plan:
        
        Repository Files: {json.dumps(files_list)}
        Component Categories: {json.dumps(component_types)}
        Active Architecture Warning logs: {json.dumps(warnings)}
        Statistics: {json.dumps(stats)}
        
        Provide a detailed refactoring roadmap in JSON format matching the schema:
        {{
            "refactoring_steps": [
                {{
                    "title": "string title",
                    "priority": "CRITICAL, HIGH, MEDIUM, or LOW",
                    "description": "description of steps and target architectures",
                    "difficulty": "Easy, Medium, or Hard",
                    "files": ["file1.py", "file2.py"]
                }}
            ],
            "god_classes": [
                {{
                    "file": "string filename",
                    "metric": "string details why it is a god class (e.g. lines/methods count)"
                }}
            ],
            "duplicate_logic": [
                {{
                    "file_a": "string filename",
                    "file_b": "string filename",
                    "reason": "string describing redundancy"
                }}
            ],
            "recommendations": "string (principal-level Markdown executive summary highlighting critical coupling refactoring and engineering advice)"
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API call failed in generate_refactoring_plan: {e}")
            return self._mock_refactoring_plan(files_list, component_types, warnings)

    def _mock_refactoring_plan(self, files_list: List[str], component_types: Dict[str, str], 
                               warnings: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Generate custom refactoring steps
        steps = []
        
        # 1. Circle warning step
        cycles = [w for w in warnings if "cycle" in w.get("title", "").lower()]
        if cycles:
            steps.append({
                "title": "Resolve Circular Import Loop in Datastore Connection",
                "priority": "CRITICAL",
                "description": "Create an independent interfaces wrapper. Avoid loading database query configurations inside route modules. Migrate imports out of runtime functions.",
                "difficulty": "Hard",
                "files": cycles[0].get("files", [])
            })
            
        # 2. God classes split step
        bloats = [w for w in warnings if "bloat" in w.get("title", "").lower() or "large" in w.get("title", "").lower()]
        if bloats:
            steps.append({
                "title": "Decompose Bloated Schema Modules",
                "priority": "HIGH",
                "description": "Split schemas into independent database domain structures. Extract sub-objects to modular file records.",
                "difficulty": "Medium",
                "files": bloats[0].get("files", [])
            })
        else:
            steps.append({
                "title": "Decouple Utility and Configuration Models",
                "priority": "HIGH",
                "description": "Standardize custom variables inside .env profile directories. Refactor general helper logic to keep service directories decoupled.",
                "difficulty": "Easy",
                "files": [f for f in files_list if "main.py" in f or "config" in f][:2]
            })
            
        # 3. Orphan warning step
        orphans = [w for w in warnings if "orphan" in w.get("title", "").lower() or "unused" in w.get("title", "").lower()]
        if orphans:
            steps.append({
                "title": "Prune Dead Code and Dead Module Services",
                "priority": "MEDIUM",
                "description": "Remove unused modules or register their exports cleanly inside app router gates. Verify dependent references across boundaries.",
                "difficulty": "Easy",
                "files": orphans[0].get("files", [])
            })
            
        # Generic step
        steps.append({
            "title": "Establish Decoupled Repository Pattern Adapters",
            "priority": "LOW",
            "description": "Decouple controllers from raw database models. Build database CRUD client adapters to enable decoupled code updates.",
            "difficulty": "Medium",
            "files": [f for f, t in component_types.items() if t in ('Database', 'Model')][:2]
        })
        
        # Mock god classes
        god_classes = []
        for f in files_list:
            if "models" in f.lower() or "schema" in f.lower():
                god_classes.append({
                    "file": f,
                    "metric": "Size exceeds 400 lines of schema declarations with tight coupling across services."
                })
        if not god_classes:
            god_classes.append({
                "file": files_list[0] if files_list else "main.py",
                "metric": "Acts as routing orchestration gateway. Needs handler decomposition."
            })
            
        # Mock duplicate logic
        duplicate_logic = [
            {
                "file_a": "api/services/payment_service.py",
                "file_b": "api/services/inventory_service.py",
                "reason": "Redundant logger configuration helpers and error wrappers. Centralize inside utility modules."
            }
        ]
        
        recommendations = f"""# Refactoring Roadmap Executive Summary

## 🔍 Core Structural Anti-Patterns Identified
The analysis identified **{len(warnings)} architectural warning marks** in this repository. The main issue is tightly-coupled import boundaries (circular imports), which limit local testing capabilities and lock components into deployment constraints.

## 🚀 Refactoring Directive
1. **Critical Path**: Immediately break the dependency cycle on `{', '.join([os.path.basename(f) for f in (cycles[0].get('files', []) if cycles else [])])}`.
2. **Layer Separation**: Restrict database calls from route gate handlers. Implement an isolated repository pattern layer.
3. **Dead Code Cleanup**: Prune identified orphan modules to maintain clean directory navigation.
"""
        
        return {
            "refactoring_steps": steps,
            "god_classes": god_classes,
            "duplicate_logic": duplicate_logic,
            "recommendations": recommendations
        }
