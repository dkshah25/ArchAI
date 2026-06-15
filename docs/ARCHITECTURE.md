# ArchAI Architecture Documentation

## System Overview

ArchAI is an AI-powered Software Architect designed to transform GitHub repositories into interactive, queryable architecture maps. It consists of two main components: a FastAPI backend and a Next.js frontend.

---

## Core Components

### 1. Repository Parser (`backend/parser.py`)

The parser is the foundation of ArchAI. It performs:

- **Git clone** — Uses GitPython to clone any public GitHub repository
- **File discovery** — Recursively discovers all source files
- **AST analysis** — Language-specific abstract syntax tree parsing
- **Entity extraction** — Identifies classes, functions, imports, decorators
- **Dependency resolution** — Builds the import/export dependency graph
- **Layer classification** — Assigns architecture layer to each entity

#### Supported Languages

| Language | Parser Type | Entities Extracted |
|---|---|---|
| Python | `ast` module | Classes, functions, imports, decorators |
| TypeScript/JS | Regex + heuristics | Classes, functions, imports/exports |
| Go | Regex | Packages, functions, imports |
| Java | Regex | Classes, methods, imports |
| Rust | Regex | Modules, functions, use statements |

#### Architecture Layer Classification

The parser classifies each entity into one of 14 architecture layers:

```python
LAYER_KEYWORDS = {
    "api":            ["router", "route", "endpoint", "controller", "handler", "view"],
    "service":        ["service", "manager", "processor", "orchestrator", "facade"],
    "model":          ["model", "schema", "entity", "domain", "dto"],
    "database":       ["database", "db", "repository", "dao", "migration", "query"],
    "queue":          ["queue", "broker", "consumer", "producer", "publisher", "event"],
    "authentication": ["auth", "oauth", "jwt", "token", "session", "permission"],
    "cache":          ["cache", "redis", "memcache", "store"],
    "storage":        ["storage", "s3", "blob", "file", "upload"],
    "external_api":   ["client", "connector", "adapter", "integration", "webhook"],
    "worker":         ["worker", "celery", "task", "job", "background"],
    "scheduler":      ["scheduler", "cron", "periodic", "timer"],
    "ai_component":   ["llm", "openai", "gemini", "embedding", "vector", "chain"],
    "utility":        ["util", "helper", "common", "shared", "base", "mixin"],
}
```

---

### 2. AI Reasoning Engine (`backend/services/ai_service.py`)

The AI service wraps Google Gemini 2.0 Flash to provide:

- **Architecture Chat** — Answers natural language questions about the codebase
- **Risk Analysis** — Identifies architectural risks and anti-patterns
- **Refactoring Roadmap** — Generates prioritized refactoring plans
- **Benchmark Scoring** — Scores repositories on architecture quality metrics
- **Change Simulation** — Simulates the impact of architectural changes
- **Report Generation** — Creates staff-ready engineering reports

#### AI Context Strategy

For each AI query, the service:
1. Retrieves the relevant entities and dependencies from SQLite
2. Summarizes the architecture into a concise context (~2000 tokens)
3. Injects the user's question with structured prompts
4. Returns structured JSON responses where applicable

---

### 3. API Layer (`backend/main.py`)

RESTful API built with FastAPI. Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Clone and analyze a repository |
| `GET` | `/api/graph/{repo_id}` | Get full dependency graph |
| `POST` | `/api/chat` | Chat with the AI about the codebase |
| `GET` | `/api/entities/{repo_id}` | List all entities |
| `POST` | `/api/blast-radius` | Compute blast radius for a file |
| `POST` | `/api/benchmark` | Score repository architecture |
| `POST` | `/api/compare` | Compare two repositories |
| `POST` | `/api/refactor-roadmap` | Generate refactoring roadmap |
| `POST` | `/api/simulate-change` | Simulate an architectural change |

---

### 4. Frontend Workspace (`frontend/app/workspace/page.tsx`)

The core workspace is a ~3000-line Next.js page managing all UI state.

#### Tab Structure

```
Workspace
├── Graph Tab           — React Flow dependency visualization
├── Chat Tab            — Architecture Q&A + Quick Queries
├── Docs Tab            — Auto-generated entity documentation
├── PR Review Tab       — Architecture-aware PR review
├── Timeline Tab        — Architecture history
├── Bench Tab           — Benchmarks, Comparison, Gauntlet leaderboard
├── Node Edit Tab       — Direct node attribute editor
└── Copilot Tab         — AI refactoring co-pilot
```

#### State Architecture

Key state pieces in the workspace:

```typescript
const [nodes, setNodes]         // React Flow graph nodes
const [edges, setEdges]         // React Flow graph edges
const [selectedNode, ...]       // Currently focused node
const [chatMessages, ...]       // Chat conversation history
const [benchData, ...]          // Benchmark results
const [blastRadius, ...]        // Blast radius analysis result
const [repoUrl, ...]            // Current analyzed repo URL
const [activeTab, ...]          // Current workspace tab
```

---

## Data Flow

```
User Input (GitHub URL)
        │
        ▼
POST /api/analyze
        │
        ▼
parser.py
  ├── git.Repo.clone_from(url)
  ├── walk_files() → source files
  ├── parse_python_ast() / parse_js() / ...
  ├── extract_entities() → Entity[]
  ├── resolve_dependencies() → Dependency[]
  ├── classify_layers() → layer assignments
  └── store_to_sqlite()
        │
        ▼
SQLite Database (archai.db)
  ├── repositories table
  ├── entities table
  ├── dependencies table
  └── analyses table
        │
        ▼
GET /api/graph/{repo_id}
        │
        ▼
Frontend: React Flow
  ├── nodes = entities
  ├── edges = dependencies
  └── colors = layer classification
        │
        ▼
User selects node → AI query
        │
        ▼
POST /api/chat
        │
        ▼
ai_service.py
  ├── build_context(repo_id, question)
  ├── gemini.generate(prompt)
  └── return structured response
```

---

## Database Schema

```sql
CREATE TABLE repositories (
    id          TEXT PRIMARY KEY,
    url         TEXT NOT NULL,
    name        TEXT,
    cloned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status      TEXT DEFAULT 'pending'
);

CREATE TABLE entities (
    id          TEXT PRIMARY KEY,
    repo_id     TEXT REFERENCES repositories(id),
    name        TEXT NOT NULL,
    type        TEXT,          -- class, function, module, etc.
    layer       TEXT,          -- api, service, model, etc.
    file_path   TEXT,
    line_number INTEGER,
    risk_score  REAL DEFAULT 0.0
);

CREATE TABLE dependencies (
    id          TEXT PRIMARY KEY,
    repo_id     TEXT REFERENCES repositories(id),
    source_id   TEXT REFERENCES entities(id),
    target_id   TEXT REFERENCES entities(id),
    dep_type    TEXT           -- import, call, inheritance, etc.
);
```

---

## Risk Scoring

Risk scores are computed per-entity and per-dependency:

| Risk Factor | Weight | Description |
|---|---|---|
| Fan-in (incoming deps) | High | Too many dependents = high blast radius |
| Fan-out (outgoing deps) | Medium | Too many dependencies = tight coupling |
| Circular dependency | Critical | Mutual dependency = architectural smell |
| File size | Low | Very large files often indicate god modules |
| Layer violations | High | Lower layer importing upper layer |
| Missing tests | Medium | Entity has no corresponding test file |

---

## Configuration

All configuration is via environment variables. See [`.env.example`](../.env.example).

---

## Extending ArchAI

### Adding a New Language

1. Create a new parser function in `parser.py`:
   ```python
   def parse_ruby(file_path: str) -> List[Entity]:
       ...
   ```

2. Register it in the `LANGUAGE_PARSERS` map:
   ```python
   LANGUAGE_PARSERS = {
       ...
       ".rb": parse_ruby,
   }
   ```

### Adding a New Architecture Layer

1. Add keywords to `LAYER_KEYWORDS` in `parser.py`
2. Add a color mapping in the frontend `NODE_COLORS` constant in `workspace/page.tsx`

### Adding a New AI Analysis Feature

1. Create a new endpoint in `main.py`
2. Implement the analysis function in `ai_service.py`
3. Add the corresponding UI in `workspace/page.tsx`
