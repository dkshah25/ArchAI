# ArchAI REST API Reference

**Base URL**: `http://localhost:8000`  
**Version**: 1.0.0  
**Format**: All request/response bodies are JSON.

---

## Authentication

No authentication required in v1. All endpoints are open. Production deployments should be placed behind a reverse proxy.

---

## System

### `GET /api/health`

Returns the current health status of the API and database.

**Response `200`**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "ok"
}
```

**Response (degraded)**:
```json
{
  "status": "degraded",
  "version": "1.0.0",
  "database": "error: unable to open database file"
}
```

---

## Repositories

### `POST /api/analyze`

Clones and analyzes a repository. Returns the full architecture graph, benchmarks, file tree, and AI summary.

**Request Body**:
```json
{
  "git_url": "https://github.com/fastapi/fastapi",
  "repo_name": "fastapi"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `git_url` | string | ✅ | Public GitHub/GitLab/Bitbucket/Codeberg URL, or a demo keyword (`demo`, `fastapi`, `ecommerce`) |
| `repo_name` | string | ❌ | Override the repository display name |

**Response `200`**:
```json
{
  "repo_id": "uuid-string",
  "name": "fastapi",
  "owner": "fastapi",
  "git_url": "https://github.com/fastapi/fastapi",
  "file_tree": { "name": "root", "type": "directory", "children": [...] },
  "diagram": {
    "system_graph": { "nodes": [...], "edges": [...], "mermaid": "..." },
    "file_graph": { "nodes": [...], "edges": [...], "mermaid": "..." },
    "warnings": [...],
    "benchmarks": { "scores": {...}, "strengths": [...], "weaknesses": [...] },
    "insights": { "risks": [...], "critical_files": [...] }
  },
  "summary": "FastAPI is a high-performance...",
  "commit_hash": "a1b2c3d4"
}
```

**Error `400`**: Invalid or unsupported repository URL.

---

### `GET /api/repos`

Returns all previously analyzed repositories, ordered by most recently analyzed.

**Response `200`**:
```json
[
  {
    "id": "uuid",
    "name": "fastapi",
    "owner": "fastapi",
    "git_url": "https://github.com/fastapi/fastapi",
    "main_branch": "main",
    "last_analyzed": "2025-06-15T18:00:00",
    "created_at": "2025-06-15T18:00:00"
  }
]
```

---

### `GET /api/repos/{repo_id}`

Returns full details for a single analyzed repository, including its latest diagram.

**Path Parameters**:
- `repo_id` — UUID of the repository

**Response `200`**: Same shape as `/api/analyze` response.  
**Error `404`**: Repository not found.

---

### `GET /api/repos/{repo_id}/versions`

Returns the analysis version history for a repository (one entry per analysis run).

**Response `200`**:
```json
[
  {
    "id": "uuid",
    "commit_hash": "a1b2c3d4",
    "created_at": "2025-06-15T18:00:00",
    "summary_text": "..."
  }
]
```

---

### `GET /api/repos/{repo_id}/history`

Returns architecture metric trend data across all versions, for timeline charts.

**Response `200`**:
```json
[
  {
    "commit": "a1b2c3d4",
    "date": "2025-06-15 18:00:00",
    "maintainability": 82,
    "modularity": 75,
    "complexity": 70,
    "warnings": 3
  }
]
```

---

## Architecture Chat

### `POST /api/repos/{repo_id}/chat`

Sends a message to the AI architect and receives an architecture-aware answer.

**Request Body**:
```json
{
  "message": "What are the highest risk files?",
  "session_id": "optional-session-uuid"
}
```

**Response `200`**:
```json
{
  "session_id": "uuid",
  "answer": "The highest risk files are...",
  "referenced_files": ["api/routes/users.py", "database/models.py"],
  "highlighted_nodes": ["api/routes/users.py"]
}
```

---

### `GET /api/repos/{repo_id}/chat/sessions`

Returns all chat sessions for a repository.

---

### `GET /api/chat/sessions/{session_id}/messages`

Returns all messages in a chat session.

---

## Analysis Features

### `GET /api/repos/{repo_id}/impact/{node_id}`

Computes blast radius — which modules would break if `node_id` changes.

**Path Parameters**:
- `node_id` — File path relative to repo root (e.g. `api/routes/users.py`)

**Response `200`**:
```json
{
  "node_id": "api/routes/users.py",
  "direct": ["main.py", "tests/test_users.py"],
  "indirect": ["api/middleware/auth.py"],
  "risk_score": 0.78,
  "risk_level": "HIGH",
  "explanation": "This file is imported by...",
  "breakages": ["main.py would fail to start"],
  "mitigation": ["Add an interface abstraction layer"]
}
```

---

### `GET /api/repos/{repo_id}/refactor`

Generates a prioritized AI refactoring roadmap for the repository.

**Response `200`**:
```json
{
  "roadmap": [
    {
      "priority": 1,
      "title": "Extract PaymentService from OrderController",
      "effort": "Medium",
      "impact": "High",
      "description": "...",
      "files": ["api/controllers/order_controller.py"]
    }
  ]
}
```

---

### `POST /api/repos/{repo_id}/simulate`

Simulates an architectural change and predicts its trade-offs.

**Request Body**:
```json
{
  "change_prompt": "Split the monolith into microservices"
}
```

---

### `GET /api/compare/{repo_a_id}/{repo_b_id}`

Compares two analyzed repositories on architecture quality dimensions.

**Response `200`**:
```json
{
  "repo_a_name": "fastapi",
  "repo_b_name": "flask",
  "scores_a": { "maintainability": 90, "modularity": 85 },
  "scores_b": { "maintainability": 72, "modularity": 68 },
  "winner": "fastapi",
  "winner_reason": "...",
  "report": "Full markdown comparison..."
}
```

---

## PR Reviews

### `POST /api/repos/{repo_id}/review`

Runs an architectural impact review simulating a PR merge.

**Request Body**:
```json
{
  "source_branch": "feature/stripe-webhook",
  "target_branch": "main",
  "pr_number": 47
}
```

---

## Knowledge Graph

### `POST /api/repos/{repo_id}/graph/query`

Runs a static graph database query (BFS/DFS path matching) over the knowledge graph.

**Request Body**:
```json
{
  "query_text": "How does authentication connect to the database?"
}
```

---

## Copilot

### `POST /api/copilot`

Generates a full system architecture design from a text prompt.

**Request Body**:
```json
{
  "prompt": "Design a real-time chat application for 1M users"
}
```

---

## Error Responses

All errors follow this shape:
```json
{
  "detail": "Human-readable error message"
}
```

| Code | Meaning |
|---|---|
| `400` | Bad request — invalid input |
| `404` | Resource not found |
| `500` | Internal server error — check backend logs |
