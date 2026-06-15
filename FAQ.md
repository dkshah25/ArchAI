# Frequently Asked Questions

## General

### What is ArchAI?
ArchAI is an open-source AI-powered Software Architect. You give it any public GitHub repository URL and it produces an interactive architecture map, risk analysis, blast radius visualization, AI-powered Q&A, benchmarks, and refactoring roadmaps — all in your browser.

### Is ArchAI free?
Yes. ArchAI is fully open source under the MIT license. You can self-host it for free forever. Just bring your own Gemini API key (which has a free tier).

### Which AI model does ArchAI use?
ArchAI uses **Google Gemini 2.0 Flash** via the `google-genai` Python SDK. It's fast, has a generous free tier, and produces strong structured outputs for architecture analysis.

### Does ArchAI store my code?
When you analyze a repository, ArchAI temporarily clones it to your local `backend/cloned_repos/` directory and stores metadata (file paths, dependencies, entity names) in a local SQLite database. No code is sent to any third-party server other than Gemini for AI analysis.

---

## Setup & Installation

### I get "GEMINI_API_KEY not set" — how do I fix it?
Copy `.env.example` to `backend/.env` and add your key:
```bash
cp .env.example backend/.env
# Edit backend/.env and add:
GEMINI_API_KEY=your_key_here
```
Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

### The backend fails to start with "ModuleNotFoundError"
Make sure you activated your virtual environment:
```bash
cd backend
source venv/bin/activate    # macOS/Linux
venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

### The frontend shows a blank page or connection error
Ensure the backend is running on port 8000 before starting the frontend:
```bash
# Terminal 1
cd backend && uvicorn main:app --port 8000

# Terminal 2
cd frontend && npm run dev
```

### Can I use a different port?
Yes. Set `CORS_ORIGINS` in `backend/.env` to match your frontend URL, e.g. `CORS_ORIGINS=http://localhost:3001`.

---

## Repository Analysis

### Which languages does ArchAI support?
Python, TypeScript, JavaScript, Go, Java, and Rust (beta). Support for Ruby, C/C++, and PHP is on the [roadmap](ROADMAP.md).

### Can I analyze private repositories?
Not yet. Private repository support via GitHub OAuth is on the roadmap for v1.2. For now, ArchAI only accepts public repository URLs.

### Which git hosts are supported?
GitHub, GitLab, Bitbucket, and Codeberg. Support for self-hosted GitLab instances is on the roadmap.

### Analysis seems stuck / takes too long
Large repos (>5,000 files) can take 2–5 minutes. The backend is working — check the terminal logs for progress. You can also set `MAX_FILES_PER_REPO=1000` in `backend/.env` to limit analysis scope.

### The graph looks empty after analysis
This usually means the parser couldn't find source files of a supported type. Check:
1. Is the repo primarily one of the supported languages?
2. Are there `.py`, `.ts`, `.js`, `.go`, `.java`, or `.rs` files in the repo?
3. Check the backend terminal for parser warnings.

---

## Features

### What is "Blast Radius Analysis"?
Click any node in the graph and run blast radius analysis to see which modules would break if that file changed. It uses static dependency graph traversal (BFS) to find all direct and indirect dependents.

### What does the Architecture Gauntlet do?
The Gauntlet benchmarks your analyzed repo against a curated leaderboard of world-class open source projects (FastAPI, Next.js, LangChain, React, Django, Supabase) across 6 architecture quality dimensions.

### Can I export reports?
The Staff Review generator in the Bench tab produces a formatted Markdown report. Copy-paste it into Notion, Confluence, or a GitHub discussion.

---

## Contributing

### How do I contribute?
Read [CONTRIBUTING.md](CONTRIBUTING.md). TL;DR: fork, branch, code, test, PR.

### What are "Good First Issues"?
Look for issues tagged `good first issue` on GitHub. These are well-scoped, self-contained tasks ideal for first-time contributors.

### I found a security vulnerability — what do I do?
Please read [SECURITY.md](SECURITY.md) and report it privately, not as a public issue.

---

## Troubleshooting

For detailed error solutions, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
