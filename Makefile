# ──────────────────────────────────────────────────────────────────────────────
# ArchAI — Makefile
# One-command developer experience
# Usage: make help
# ──────────────────────────────────────────────────────────────────────────────

.PHONY: help dev dev-backend dev-frontend install install-backend install-frontend \
        test lint format build clean verify

# Default target
help:
	@echo ""
	@echo "  ArchAI Developer Commands"
	@echo "  ─────────────────────────────────────────────────────"
	@echo "  make install         Install all dependencies"
	@echo "  make dev             Start backend + frontend (requires tmux)"
	@echo "  make dev-backend     Start FastAPI backend (port 8000)"
	@echo "  make dev-frontend    Start Next.js frontend (port 3000)"
	@echo "  make test            Run backend test suite"
	@echo "  make lint            Lint backend Python code (ruff)"
	@echo "  make format          Format backend Python code (ruff)"
	@echo "  make verify          Run verification checks"
	@echo "  make build           Build frontend production bundle"
	@echo "  make clean           Remove build artifacts & cloned repos"
	@echo "  ─────────────────────────────────────────────────────"
	@echo ""

# ── Installation ──────────────────────────────────────────────────────────────

install: install-backend install-frontend
	@echo "✅  All dependencies installed."

install-backend:
	@echo "→ Setting up Python virtual environment..."
	cd backend && python -m venv venv
	@echo "→ Installing backend dependencies..."
	cd backend && venv/bin/pip install -r requirements.txt 2>/dev/null || \
		cd backend && venv\Scripts\pip install -r requirements.txt
	@echo "✅  Backend ready."

install-frontend:
	@echo "→ Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅  Frontend ready."

# ── Development ───────────────────────────────────────────────────────────────

dev-backend:
	@echo "→ Starting ArchAI backend on http://localhost:8000 ..."
	cd backend && venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload 2>/dev/null || \
		cd backend && venv\Scripts\uvicorn main:app --host 127.0.0.1 --port 8000 --reload

dev-frontend:
	@echo "→ Starting Next.js frontend on http://localhost:3000 ..."
	cd frontend && npm run dev

# ── Testing & Quality ─────────────────────────────────────────────────────────

test:
	@echo "→ Running backend test suite..."
	cd backend && venv/bin/python -m pytest tests/ -v 2>/dev/null || \
		cd backend && venv\Scripts\python -m pytest tests/ -v

verify:
	@echo "→ Running verification checks..."
	cd backend && venv/bin/python verify.py 2>/dev/null || \
		cd backend && venv\Scripts\python verify.py

lint:
	@echo "→ Linting backend Python code..."
	cd backend && venv/bin/ruff check . 2>/dev/null || \
		cd backend && venv\Scripts\ruff check .

format:
	@echo "→ Formatting backend Python code..."
	cd backend && venv/bin/ruff format . 2>/dev/null || \
		cd backend && venv\Scripts\ruff format .

# ── Build ─────────────────────────────────────────────────────────────────────

build:
	@echo "→ Building Next.js production bundle..."
	cd frontend && npm run build
	@echo "✅  Build complete."

# ── Cleanup ───────────────────────────────────────────────────────────────────

clean:
	@echo "→ Cleaning build artifacts..."
	rm -rf frontend/.next frontend/out
	rm -rf backend/__pycache__ backend/**/__pycache__
	rm -rf backend/.pytest_cache backend/htmlcov backend/.coverage
	@echo "→ Cleaning cloned repositories..."
	rm -rf backend/cloned_repos/*
	@echo "✅  Clean complete."
