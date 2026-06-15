# Known Limitations

This document honestly documents ArchAI's known inaccuracies and limitations. We believe transparency about limitations builds more trust than hiding them.

---

## Parser Limitations

### Python: Dynamic Imports
ArchAI cannot detect dynamically constructed imports:
```python
# Not detected:
module = importlib.import_module(f"plugins.{plugin_name}")
```
**Impact**: Some plugin-based architectures (e.g., Pytest plugins, Django apps) may appear less connected than they are.

### JavaScript/TypeScript: Barrel Exports
Re-exports via `index.ts` barrel files may not be fully resolved:
```typescript
// index.ts — exports from here may not propagate correctly
export { UserService } from './UserService';
```
**Impact**: Some TS/JS codebases may show disconnected nodes that are actually connected.

### Go: Interface Implementations
ArchAI cannot statically infer which concrete types implement a Go interface.
**Impact**: Interface-heavy Go codebases may appear less coupled than runtime behavior suggests.

### Rust: Trait Objects and Macros
Macro-generated code and `dyn Trait` patterns are not resolved.
**Impact**: Rust crates using heavy macro usage (e.g., `serde`, `tokio`) may miss some connections.

---

## AI Analysis Limitations

### Hallucination Risk on Large Repos
For repositories with >5,000 files, the context sent to Gemini is summarized. This can cause the AI to:
- Misidentify the primary design pattern
- Miss connections between distant modules
- Undercount circular dependencies

**Mitigation**: Use specific questions about specific files rather than broad queries.

### Blast Radius is Static Only
Blast radius analysis uses static import graph traversal. It does **not** detect:
- Runtime-only dependencies (e.g., dependency injection frameworks)
- Database-level coupling (e.g., shared tables)
- Message queue coupling (e.g., Kafka topic consumers)

### Refactoring Quality Varies by Codebase Size
Refactoring roadmaps are more accurate for codebases with 50–500 files. Very small repos (<20 files) may receive generic suggestions; very large repos (>10k files) may miss repo-specific context.

---

## Infrastructure Limitations

### No Incremental Analysis
Every analysis re-clones and re-parses the entire repository. There is no incremental update when a single file changes.

### SQLite Concurrency
If multiple users analyze repositories simultaneously on the same server, SQLite write locks may cause race conditions. Use PostgreSQL for multi-user deployments (see `DESIGN_DECISIONS.md`).

### Large Monorepos (>10k files)
Repositories with >10,000 files may:
- Take >10 minutes to analyze
- Produce graphs too dense to navigate
- Hit Gemini context limits

**Workaround**: Set `MAX_FILES_PER_REPO=2000` in `backend/.env` to cap analysis scope.

---

## Accuracy Benchmarks (Self-Assessed)

| Metric | Estimated Accuracy | Confidence |
|---|---|---|
| Layer detection (Python) | ~85–90% | High |
| Layer detection (TS/JS) | ~75–80% | Medium |
| Layer detection (Go/Java) | ~70–75% | Medium |
| Dependency graph (Python) | ~90–95% | High |
| Dependency graph (TS/JS) | ~80–85% | Medium |
| Circular dependency detection | ~95% | High |
| God module detection | ~80% | Medium |
| Blast radius (direct) | ~95% | High |
| Blast radius (indirect) | ~75% | Medium |
| AI chat relevance | ~80–85% | Medium |

*These are self-assessed estimates. Formal evaluation data is in `evals/`.*

---

## Reporting New Limitations

If you find a case where ArchAI produces clearly wrong output, please open a GitHub issue with:
- The repository URL
- The question asked (if AI chat)
- The expected output
- The actual output

This helps us systematically improve accuracy.
