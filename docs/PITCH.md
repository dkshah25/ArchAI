# ArchAI — Investor Pitch

## The Problem

Software systems are increasingly complex. The average engineering team at a 50-person company manages codebases with 100,000+ lines of code across dozens of services. Yet the tools to *understand* that architecture haven't changed in 20 years.

**Today's workflow:**
- New engineer joins → 3 months to understand the codebase
- CTO asks "what breaks if we touch payments?" → 2 days of manual analysis
- Architecture review → 2-hour meeting with one engineer drawing boxes on a whiteboard
- Tech debt prioritization → gut feel and tribal knowledge

This is slow, expensive, and error-prone. Architecture knowledge is trapped in human heads.

---

## The Market

**DevTools is a $12B+ market growing at 18% CAGR.**

Target buyers:
- **Engineering teams** at growth-stage startups (10–200 engineers) — paying $29+/mo per seat
- **CTOs and Staff Engineers** who own architecture decisions
- **Enterprise DevOps** teams running compliance, audit, and technical risk reviews

Comparable exits:
- Sourcegraph raised $225M at $2.6B (code intelligence)
- GitLens (GitKraken) sold for $100M+ (git visualization)
- Swimlane (automation) valued at $557M

ArchAI addresses a gap none of these tools fill: **architecture-level AI reasoning**.

---

## The Solution

ArchAI is an AI-powered Software Architect.

**Paste a GitHub URL. In 30 seconds, understand the entire system.**

What ArchAI does that no other tool does:
1. **Architecture Layer Detection** — auto-classifies every module as API, Service, Model, DB, Queue, Auth, Cache, Worker, etc.
2. **Blast Radius Analysis** — "if I change this file, what breaks?" answered in 2 seconds
3. **AI Architecture Chat** — ask any question about the codebase in plain English
4. **Risk Detection** — finds circular dependencies, god modules, dead code, coupling violations
5. **Architecture Benchmarking** — scores your codebase against FastAPI, Next.js, LangChain
6. **Refactoring Roadmap** — AI-generated, prioritized, effort-estimated plan

---

## Differentiation

| Tool | What it does | What it misses |
|---|---|---|
| Sourcegraph | Code search | Architecture reasoning |
| CodeClimate | Code quality scores | Dependency intelligence |
| Swimm | Documentation | Graph analysis |
| ChatGPT | General Q&A | Codebase-specific answers |
| **ArchAI** | **Architecture Intelligence** | **Everything above, unified** |

ArchAI is the only tool that combines static analysis + knowledge graph + AI reasoning into a single architecture-aware product.

---

## Architecture

```
GitHub URL
    ↓
AST Parser (Python, TS, JS, Go, Java, Rust)
    ↓
Architecture Knowledge Graph (SQLite → PostgreSQL)
    ↓
Gemini 2.0 Flash (Reasoning Layer)
    ↓
Interactive Architecture Map (React Flow)
```

**Tech stack**: FastAPI · Next.js 15 · Google Gemini 2.0 · React Flow · SQLite/PostgreSQL

---

## Business Model

**Open Core**: The core analysis engine is MIT-licensed (community trust, developer adoption).

**Revenue streams**:

| Tier | Price | Target |
|---|---|---|
| Community | Free (self-hosted) | Individual developers |
| Engineering | $29/mo per user | Startup engineering teams |
| Enterprise | Custom / annual | 100+ engineer orgs |

**Enterprise features** (behind paywall):
- GitHub OAuth (private repos)
- SSO / SAML
- On-premise deployment
- Custom compliance rules
- Slack/Jira integration
- Architecture alerts

---

## Traction

- Working product with full feature set
- 11 major features shipped in v1.0:
  - Architecture Graph, AI Chat, Blast Radius, Benchmarks, Comparison, Refactoring Roadmap, Change Simulation, History, PR Review, Gauntlet, Copilot
- Analyzed: FastAPI, Next.js, LangChain, Django, React, Supabase successfully
- Open source — positioned for developer community adoption

---

## Why Now

Three forces converge in 2025:

1. **AI is fast enough** — Gemini 2.0 Flash can analyze a codebase in seconds, not minutes
2. **Codebases are exploding in complexity** — AI-assisted development produces more code, faster, making architecture understanding harder
3. **Developer tools are the new enterprise software** — companies pay per-seat for tools that make engineers 2x faster

The window to establish a category-defining architecture intelligence tool is open now.

---

## Why ArchAI Wins

1. **Developer-first**: Open source → free → trust → enterprise upsell (the Hashicorp playbook)
2. **Network effects**: Shared architecture reports create team collaboration workflows
3. **Data flywheel**: Every analyzed repo improves our architecture pattern library
4. **Speed**: Analysis in 30 seconds vs. days of manual work — the ROI is obvious
5. **No competition**: No well-funded competitor owns "architecture intelligence" yet

---

## The Ask

Seeking: **$500K pre-seed** to:
- Hire 2 engineers (frontend + backend)
- Build GitHub OAuth + private repo support
- Launch VS Code extension (100K developer distribution channel)
- 6-month runway to reach $10K MRR

---

## Contact

**Dharmit Shah** — Founder  
GitHub: [github.com/dharmitshah](https://github.com/dharmitshah)  
Project: [github.com/dharmitshah/archai](https://github.com/dharmitshah/archai)
