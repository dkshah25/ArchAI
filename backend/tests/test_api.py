"""
API integration tests for ArchAI backend.
The database is initialized by conftest.py before this module runs.
"""
import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, validate_git_url
from fastapi.testclient import TestClient


# ─── Shared client fixture ────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def client(init_test_database):  # noqa: F811  — depends on conftest fixture
    """TestClient with DB guaranteed to be initialized."""
    with TestClient(app) as c:
        yield c


# ─── Health Endpoint ──────────────────────────────────────────────────────────

class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200

    def test_health_has_status_field(self, client):
        response = client.get("/api/health")
        data = response.json()
        assert "status" in data
        assert data["status"] in ("ok", "degraded")

    def test_health_has_version(self, client):
        response = client.get("/api/health")
        assert response.json()["version"] == "1.0.0"

    def test_health_has_database(self, client):
        response = client.get("/api/health")
        assert "database" in response.json()


# ─── URL Validation ───────────────────────────────────────────────────────────

class TestUrlValidation:
    def test_github_url_allowed(self):
        assert validate_git_url("https://github.com/fastapi/fastapi") is True

    def test_gitlab_url_allowed(self):
        assert validate_git_url("https://gitlab.com/user/repo") is True

    def test_bitbucket_url_allowed(self):
        assert validate_git_url("https://bitbucket.org/user/repo") is True

    def test_codeberg_url_allowed(self):
        assert validate_git_url("https://codeberg.org/user/repo") is True

    def test_internal_ip_blocked(self):
        assert validate_git_url("http://192.168.1.1/repo") is False

    def test_localhost_blocked(self):
        assert validate_git_url("http://localhost/evil-repo") is False

    def test_unknown_host_blocked(self):
        assert validate_git_url("https://evil-git-server.com/repo") is False

    def test_ftp_scheme_blocked(self):
        assert validate_git_url("ftp://github.com/repo") is False

    def test_empty_string_blocked(self):
        assert validate_git_url("") is False


# ─── Analyze Endpoint ─────────────────────────────────────────────────────────

class TestAnalyzeEndpoint:
    def test_demo_mode_returns_200(self, client):
        """Demo keyword should always succeed without network access."""
        response = client.post("/api/analyze", json={"git_url": "demo"})
        assert response.status_code == 200

    def test_demo_response_has_repo_id(self, client):
        response = client.post("/api/analyze", json={"git_url": "fastapi"})
        assert response.status_code == 200
        data = response.json()
        assert "repo_id" in data
        assert len(data["repo_id"]) > 0

    def test_demo_response_has_diagram(self, client):
        response = client.post("/api/analyze", json={"git_url": "demo"})
        data = response.json()
        assert "diagram" in data

    def test_invalid_url_returns_400(self, client):
        response = client.post("/api/analyze", json={"git_url": "http://internal.corp/secret"})
        assert response.status_code == 400

    def test_invalid_url_error_message(self, client):
        response = client.post("/api/analyze", json={"git_url": "http://malicious.example.com/repo"})
        assert "Invalid repository URL" in response.json()["detail"]


# ─── Repos Endpoint ───────────────────────────────────────────────────────────

class TestReposEndpoint:
    def test_repos_returns_list(self, client):
        response = client.get("/api/repos")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
