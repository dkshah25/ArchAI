# ArchAI Evaluation Framework

This directory contains the evaluation framework for measuring ArchAI's architecture analysis accuracy against well-known open-source repositories.

---

## Purpose

ArchAI's evaluation framework answers: **"How accurate is ArchAI's analysis?"**

It measures:

| Metric | Description |
|---|---|
| Layer Detection Accuracy | Does ArchAI correctly classify API, Service, Model, DB, etc.? |
| Risk Detection Accuracy | Are high-risk files correctly flagged? Are there false positives? |
| Dependency Graph Accuracy | Does the graph reflect true import relationships? |
| Blast Radius Accuracy | Does blast radius analysis find the correct impacted files? |
| AI Chat Relevance | Are AI answers architecturally correct and grounded? |
| Refactoring Quality | Are refactoring suggestions actionable and accurate? |

---

## Evaluation Repositories

| Repository | Expected Primary Layer | Min Nodes |
|---|---|---|
| [FastAPI](https://github.com/fastapi/fastapi) | API | 20 |
| [Django](https://github.com/django/django) | Framework | 50 |
| [Flask](https://github.com/pallets/flask) | API | 10 |
| [LangChain](https://github.com/langchain-ai/langchain) | AI Component | 30 |
| [React](https://github.com/facebook/react) | Utility | 20 |

---

## Running Evaluations

```bash
cd backend
source venv/bin/activate
python ../evals/run_evals.py
```

This will:
1. Analyze each repository in `datasets.py`
2. Check expected layer classifications
3. Ask standard architecture questions
4. Score results against known-good answers
5. Generate a report in `evals/reports/`

---

## Evaluation Report Format

Each run generates a JSON report:

```json
{
  "timestamp": "2025-06-15T18:00:00",
  "overall_score": 87.3,
  "results": [
    {
      "repo": "fastapi",
      "layer_detection": 92,
      "risk_detection": 88,
      "dependency_accuracy": 95,
      "blast_radius": 85,
      "ai_chat_relevance": 80,
      "refactoring_quality": 78
    }
  ],
  "failure_cases": [...]
}
```

---

## Known Limitations

See `KNOWN_LIMITATIONS.md` for documented cases where ArchAI is known to produce inaccurate results.
