# Changelog

All notable changes to ArchAI will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Progress
- VS Code Extension (beta)
- Performance improvements for monorepos >10k files
- Dark/light mode toggle

---

## [1.0.0] — 2025-06-15

### 🎉 Initial Release

This is the first public release of ArchAI — an AI-powered Software Architect that transforms any GitHub repository into an interactive architecture intelligence system.

### Added

#### Core Engine
- **Repository Parser** — AST-based analysis supporting Python, TypeScript, JavaScript, Go, Java, and Rust
- **Entity Extraction** — Automatic detection of classes, functions, modules, and their relationships
- **Dependency Graph** — Full import/export dependency resolution with cycle detection
- **Architecture Layer Classification** — Auto-classifies nodes into: API, Controller, Service, Model, Database, Queue, Authentication, Cache, Storage, External API, Worker, Scheduler, AI Component, Utility

#### AI Intelligence (Gemini 2.0 Flash)
- **Architecture Chat** — Natural language Q&A about any codebase
- **Risk Detection Engine** — Identifies circular dependencies, god modules, dead code, tight coupling violations
- **Risk Scoring** — Per-file risk scores with severity levels (Critical, High, Medium, Low)
- **Architecture Pattern Recognition** — Identifies MVC, layered, microservices, and monolithic patterns

#### Analysis Features
- **Blast Radius Analysis** — Visualize which modules are impacted by changing any single file
- **Architecture Benchmarking** — Score any repository on: complexity, coupling, cohesion, modularity, test coverage, maintainability
- **Refactoring Roadmap** — AI-generated, prioritized list of refactoring steps
- **Change Simulation** — Simulate architectural refactors before writing code
- **Multi-Repo Comparison** — Compare any two codebases side-by-side
- **Architecture History** — Track how architecture evolves across commits
- **Architecture Gauntlet** — Benchmark against FastAPI, Next.js, LangChain, Supabase, React, Django leaderboard

#### Reporting
- **Staff Review Generator** — Export architecture reports in engineering review format
- **Quick Graph Queries** — One-click common architecture questions

#### UI/UX
- **Interactive React Flow Graph** — Zoom, pan, filter, and click nodes for details
- **Node Detail Sidebar** — Full metadata for any node (type, risk, connections, AI summary)
- **Architecture Chat Panel** — Persistent conversation about the codebase
- **Benchmarks Tab** — Visual radar charts, gauge meters, leaderboard tables
- **Docs Panel** — Auto-generated documentation for any analyzed entity
- **PR Review Panel** — Architecture-aware code review suggestions
- **Timeline Panel** — Architecture evolution over time
- **Copilot Panel** — AI refactoring co-pilot
- **Node Editor** — Direct node attribute editing

### Technical Stack
- **Backend**: FastAPI 0.110+, Python 3.11+, SQLite, GitPython
- **Frontend**: Next.js 15, TypeScript, React Flow, Recharts, Tailwind CSS
- **AI**: Google Gemini 2.0 Flash via `google-genai` SDK

---

## Version History

| Version | Date | Highlights |
|---|---|---|
| 1.0.0 | 2025-06-15 | Initial public release |

---

[Unreleased]: https://github.com/dharmitshah/archai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/dharmitshah/archai/releases/tag/v1.0.0
