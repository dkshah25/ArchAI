"""
Pytest configuration: initialize the database schema before the test session.
This ensures all tables exist when using TestClient (which doesn't auto-run lifespan).
"""
import os
import sys
import sqlite3
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(scope="session", autouse=True)
def init_test_database():
    """Create all database tables before the test session starts."""
    schema_path = os.path.join(os.path.dirname(__file__), "..", "database", "schema.sql")
    db_path = os.environ.get("DATABASE_URL", "archai_test_ci.db")

    conn = sqlite3.connect(db_path)
    with open(schema_path, "r") as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()

    # Point the app at this test DB
    os.environ["DATABASE_URL"] = db_path

    yield

    # Cleanup
    conn = sqlite3.connect(db_path)
    conn.close()
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except OSError:
            pass
