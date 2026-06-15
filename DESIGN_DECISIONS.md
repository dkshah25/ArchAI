# Design Decisions

This document explains the key architectural and product decisions made in ArchAI and the reasoning behind them. This is a living document — each significant decision gets recorded here.

---

## ADR-001: SQLite over PostgreSQL

**Decision**: Use SQLite as the primary database.

**Context**: ArchAI is a self-hosted developer tool targeting individual engineers and small teams. We needed a database that requires zero setup.

**Rationale**:
- SQLite requires no server, no credentials, no `docker-compose` just for the DB
- Eliminates the biggest friction point in self-hosting
- The schema is compatible with PostgreSQL (noted in schema comments) — migration path exists
- Concurrent write volume is low (one user analyzes one repo at a time)

**Trade-offs**:
- No built-in connection pooling (we use per-request connections)
- Not suitable for multi-user SaaS deployments (intentionally out of scope for v1)

**When we'll reconsider**: When multi-user team workspaces are implemented (v2.0).

---

## ADR-002: Shallow Git Clone (depth=1)

**Decision**: Always clone with `depth=1`.

**Context**: Repository analysis only needs the current state of the code, not full git history.

**Rationale**:
- Reduces clone time from minutes to seconds for large repos
- Reduces disk usage by 70–90% for repos with long histories
- The architecture graph is a point-in-time snapshot anyway

**Trade-offs**:
- Cannot do git blame or historical file attribution
- Cannot traverse git history for the Architecture History feature (we use DB versions instead)

---

## ADR-003: Gemini 2.0 Flash over GPT-4

**Decision**: Use Google Gemini 2.0 Flash as the AI backbone.

**Context**: We evaluated GPT-4o, Claude 3.5, and Gemini 2.0 Flash.

**Rationale**:
- Gemini 2.0 Flash has a **generous free tier** — critical for a self-hosted open source tool
- Latency is consistently 2–4x faster than GPT-4o at equivalent quality
- `google-genai` SDK has excellent structured output support
- Aligns with the project's goal: zero cost to run for personal use

**Trade-offs**:
- Users must have a Google account for an API key
- Not LLM-agnostic (yet — see Roadmap)

**When we'll reconsider**: When we add an LLM provider abstraction layer (v2.0).

---

## ADR-004: Single Page Workspace over Multi-Page App

**Decision**: The entire analysis workspace lives in one page (`/workspace/page.tsx`).

**Context**: The workspace has many interconnected panels (graph, chat, benchmarks, blast radius, history).

**Rationale**:
- All panels share a large amount of state (repo ID, nodes, selected node, chat history)
- Lifting state to a global store (Zustand/Redux) for a multi-page app adds complexity without benefit
- Users don't navigate "away" from a workspace — they switch between panel modes

**Trade-offs**:
- `page.tsx` is currently very large (~3000+ lines)
- Component extraction is a future refactoring priority

**When we'll reconsider**: When the workspace exceeds 5000 lines, we'll extract panels into separate components with Zustand.

---

## ADR-005: File-Level Graph Nodes (not Class/Function-Level)

**Decision**: The primary graph shows file-level nodes, not individual classes or functions.

**Context**: Should the graph show `main.py → service.py` or `main.PayService → service.ServiceImpl`?

**Rationale**:
- File-level graphs are readable for repos with thousands of functions
- Most architecture discussions happen at the module/file level
- Class/function-level data is available in the "Node Details" sidebar on click
- The knowledge graph (Phase 6) stores entity-level data for AI queries

**Trade-offs**:
- Misses intra-file coupling
- Can't show "which class in service.py uses UserModel"

**When we'll reconsider**: The knowledge graph already stores this — a future "deep graph" mode can expose it.

---

## ADR-006: AST Parsing over LLM-based Parsing

**Decision**: Use Python's `ast` module and regex for code parsing, not LLM-based parsing.

**Context**: Should we ask Gemini to parse the code, or use static analysis tools?

**Rationale**:
- Static AST parsing is **deterministic** — same code always produces same graph
- No API cost for parsing (Gemini calls are reserved for reasoning, not parsing)
- Parsing is fast (<5s for most repos) — LLM parsing would take minutes
- Static parsing can't hallucinate — it reflects exactly what's in the code

**Trade-offs**:
- Regex-based parsing for non-Python languages is less accurate
- Cannot infer runtime behavior (only static structure)

---

## ADR-007: No Authentication in v1

**Decision**: v1 has no user authentication.

**Context**: Should we add login/OAuth from day one?

**Rationale**:
- Authentication adds significant complexity and setup friction
- v1 targets individual developers self-hosting for their own use
- Adding auth before proving core value is premature
- Each self-hosted instance is single-tenant by nature

**Trade-offs**:
- Multiple users on the same instance share a database
- No audit log of who analyzed what

**When we'll reconsider**: When multi-user team workspaces are added (v2.0 — GitHub OAuth).

---

## ADR-008: URL Allowlist for SSRF Protection

**Decision**: Validate git URLs against an allowlist of trusted hosts before cloning.

**Context**: The `/api/analyze` endpoint accepts arbitrary URLs and runs `git clone`.

**Rationale**:
- Without validation, an attacker could use `git clone` to probe internal network services (SSRF)
- Allowlisting `github.com`, `gitlab.com`, `bitbucket.org`, `codeberg.org` covers 99%+ of use cases
- This is the simplest and most robust defense

**Trade-offs**:
- Self-hosted GitLab instances are not supported in v1
- Users with internal private repos cannot use ArchAI until OAuth is added

**When we'll reconsider**: When GitHub OAuth is implemented, we'll validate OAuth tokens instead of URL allowlists.
