# ArchAI Demo Script
# 60-Second Demo Walkthrough

This script shows how to demonstrate ArchAI end-to-end in under 60 seconds.

---

## Setup (Before the Demo)

```bash
# Start both servers
# Terminal 1:
cd backend && uvicorn main:app --port 8000

# Terminal 2:
cd frontend && npm run dev

# Open: http://localhost:3000
```

---

## The 60-Second Demo

### Step 1 — Open ArchAI (5 sec)
Navigate to `http://localhost:3000`

> *"ArchAI turns any GitHub repository into a living architecture map. Let me show you."*

---

### Step 2 — Paste a Repository (10 sec)
Click **"Launch Sandbox"** → In the URL input, paste:
```
https://github.com/fastapi/fastapi
```
Click **Analyze Repository**.

> *"Cloning and parsing right now — AST analysis, dependency resolution, layer classification."*

---

### Step 3 — Explore the Graph (10 sec)
- Point to the **color-coded nodes** → *"Each color is an architecture layer — cyan is API, purple is Service, green is DB."*
- Click on `fastapi/applications.py` → right sidebar shows risk score, connections, type
- Zoom in on the dense cluster near `fastapi/routing.py`

> *"This is the entire codebase as a living architecture map. Every import is an edge."*

---

### Step 4 — Ask the AI (15 sec)
Click the **Chat** tab and type:
```
What are the highest risk files and why?
```

AI responds with ranked files and reasons. Nodes highlight on the graph.

> *"This is not a generic AI. It has read every file and knows the exact dependency graph."*

---

### Step 5 — Blast Radius (10 sec)
Click any high-risk node → Click **"Blast Radius"** button.

> *"If I change this file, here are every module that breaks — statically computed from the graph."*

---

### Step 6 — Benchmarks (10 sec)
Click **Bench** tab → **Gauntlet** sub-tab.

> *"FastAPI scores 91/100 on our Architecture Gauntlet — benchmarked against Next.js, LangChain, Django, React, Supabase."*

---

## Key Talking Points

- **Zero manual work** — paste URL, get architecture in 30 seconds
- **AI that knows the code** — not generic, codebase-specific
- **Blast radius** — the question every engineer asks before every merge
- **Open source** — run it yourself, no data leaves your machine (except Gemini calls)

---

## Demo Repository Alternatives

| Repo | Why Use It |
|---|---|
| `https://github.com/fastapi/fastapi` | Clean layered Python — great graph |
| `https://github.com/pallets/flask` | Small, fast to clone, clear structure |
| `https://github.com/langchain-ai/langchain` | Shows AI Component layer detection |
| Type `demo` instead of URL | Instant mock — no internet needed |
