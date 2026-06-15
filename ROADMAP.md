# ArchAI Roadmap

This document outlines the planned development direction for ArchAI. Items are organized by phase and priority.

> **Note**: This roadmap reflects current intentions and may change based on community feedback and priorities.

---

## ✅ Completed (v1.0)

- [x] Multi-language repository parsing (Python, JS, TS, Go, Java, Rust)
- [x] AST-based entity and dependency extraction
- [x] React Flow interactive dependency graph
- [x] Architecture layer classification (API, Service, Model, DB, Queue, Auth…)
- [x] AI-powered architecture chat (Gemini 2.0)
- [x] Risk detection engine (circular deps, god modules, dead code, coupling violations)
- [x] Blast radius analysis — see the impact of any change
- [x] Architecture benchmarking and scoring system
- [x] Multi-repo comparison dashboard
- [x] Refactoring roadmap generation
- [x] Change simulation engine
- [x] Architecture history and evolution tracking
- [x] Staff review / engineering report export
- [x] Architecture Gauntlet leaderboard

---

## 🔄 In Progress (v1.1)

- [ ] Performance improvements for large monorepos (>10k files)
- [ ] Improved Rust and C++ parsing fidelity
- [ ] Better error messages for unsupported repository types
- [ ] Dark/light mode toggle
- [ ] Graph layout options (hierarchical, force-directed, radial)

---

## 🗓️ Short-Term (v1.2 — Q3 2025)

### Developer Experience
- [ ] **VS Code Extension** — ArchAI panel inside your editor
- [ ] **CLI tool** — `archai analyze <repo>` from the terminal
- [ ] **GitHub Action** — run architecture analysis on every PR

### Intelligence
- [ ] **Architecture diff** — compare architecture between any two commits
- [ ] **Pattern detection** — identify MVC, hexagonal, CQRS, microservices patterns
- [ ] **Security analysis** — detect hardcoded secrets, unsafe dependencies
- [ ] **Test coverage overlay** — visualize which modules lack test coverage

### Collaboration
- [ ] **Shareable links** — share a specific graph view via URL
- [ ] **Annotations** — leave comments on any node or edge
- [ ] **Team workspaces** — multiple people viewing the same analysis

---

## 📅 Medium-Term (v2.0 — Q4 2025)

### Authentication & Private Repos
- [ ] **GitHub OAuth** — analyze private repositories securely
- [ ] **GitLab & Bitbucket** — support non-GitHub hosts
- [ ] **User accounts** — save and revisit past analyses

### Real-Time Capabilities
- [ ] **Incremental analysis** — update graph as files change (watch mode)
- [ ] **Live collaboration** — real-time shared architecture sessions (WebSockets)
- [ ] **IDE integration API** — language server protocol (LSP) support

### Intelligence Upgrades
- [ ] **ADR generation** — auto-generate Architecture Decision Records
- [ ] **Architecture anti-pattern library** — explain and suggest fixes for 20+ anti-patterns
- [ ] **Dependency upgrade advisor** — flag outdated or vulnerable dependencies
- [ ] **Cost analysis** — estimate infrastructure costs from architecture

---

## 🔮 Long-Term Vision (v3.0+)

- [ ] **Self-healing architecture** — automated refactoring PRs via AI agents
- [ ] **Architecture as Code** — define desired architecture in YAML, enforce via CI
- [ ] **Cross-team intelligence** — aggregate insights across an entire organization's repos
- [ ] **LLM-agnostic** — support Claude, GPT-4, Llama as alternative AI backends
- [ ] **Mobile app** — native iOS/Android for on-the-go architecture review
- [ ] **On-premise deployment** — enterprise self-hosted version with SSO

---

## 💡 Community Requests

Have a feature idea? Open a [Feature Request](https://github.com/dharmitshah/archai/issues/new?template=feature_request.md) and it may appear on this roadmap.

The items below have been requested by the community and are under consideration:

- Ruby and PHP language support
- JetBrains IDE plugin
- Slack/Teams integration for architecture alerts
- Export to Mermaid / PlantUML diagrams
- Kubernetes / Docker Compose architecture visualization

---

*Last updated: June 2025*
