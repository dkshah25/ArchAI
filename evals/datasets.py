"""
ArchAI Evaluation Framework
============================
Measures architecture analysis accuracy against known-good repositories.

Usage:
    python evals/run_evals.py

Requirements:
    GEMINI_API_KEY must be set in backend/.env or environment.
"""

EVAL_REPOSITORIES = [
    {
        "url": "https://github.com/fastapi/fastapi",
        "name": "FastAPI",
        "expected_primary_layer": "API",
        "expected_has_layers": ["API", "Service", "Utility"],
        "expected_patterns": ["layered", "framework"],
        "known_critical_files": ["fastapi/applications.py", "fastapi/routing.py"],
        "min_nodes": 20,
        "max_risk_false_positives": 2,
    },
    {
        "url": "https://github.com/django/django",
        "name": "Django",
        "expected_primary_layer": "Framework",
        "expected_has_layers": ["Model", "Service", "Utility", "Database"],
        "expected_patterns": ["mvc", "layered"],
        "known_critical_files": ["django/db/models/base.py", "django/http/request.py"],
        "min_nodes": 50,
        "max_risk_false_positives": 5,
    },
    {
        "url": "https://github.com/pallets/flask",
        "name": "Flask",
        "expected_primary_layer": "API",
        "expected_has_layers": ["API", "Utility"],
        "expected_patterns": ["microframework"],
        "known_critical_files": ["src/flask/app.py"],
        "min_nodes": 10,
        "max_risk_false_positives": 2,
    },
    {
        "url": "https://github.com/langchain-ai/langchain",
        "name": "LangChain",
        "expected_primary_layer": "AI Component",
        "expected_has_layers": ["AI Component", "Service", "External API"],
        "expected_patterns": ["pipeline", "chain"],
        "known_critical_files": ["libs/langchain/langchain/chains/base.py"],
        "min_nodes": 30,
        "max_risk_false_positives": 5,
    },
    {
        "url": "https://github.com/facebook/react",
        "name": "React",
        "expected_primary_layer": "Utility",
        "expected_has_layers": ["Utility", "Service"],
        "expected_patterns": ["library"],
        "known_critical_files": ["packages/react/src/React.js"],
        "min_nodes": 20,
        "max_risk_false_positives": 3,
    },
]

EVAL_QUESTIONS = [
    "What are the main architectural layers?",
    "What are the highest risk files?",
    "What is the primary design pattern used?",
    "What are the most critical modules?",
    "Are there any circular dependencies?",
]

EVAL_METRICS = [
    "layer_detection_accuracy",
    "risk_detection_accuracy",
    "dependency_graph_accuracy",
    "blast_radius_accuracy",
    "ai_chat_relevance",
    "refactoring_quality",
]
