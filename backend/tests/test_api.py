import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, validate_git_url
from fastapi.testclient import TestClient

client = TestClient(app)


class TestHealthEndpoint:
    def test_health_returns_200(self):
        response = client.get("/api/health")
        assert response.status_code == 200

    def test_health_has_status_field(self):
        response = client.get("/api/health")
        data = response.json()
        assert "status" in data
        assert data["status"] in ("ok", "degraded")

    def test_health_has_version(self):
        response = client.get("/api/health")
        assert response.json()["version"] == "1.0.0"

    def test_health_has_database(self):
        response = client.get("/api/health")
        assert "database" in response.json()


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


class TestAnalyzeEndpoint:
    def test_demo_mode_returns_200(self):
        """Demo keyword should always succeed without network access."""
        response = client.post("/api/analyze", json={"git_url": "demo"})
        assert response.status_code == 200

    def test_demo_response_has_repo_id(self):
        response = client.post("/api/analyze", json={"git_url": "fastapi"})
        assert response.status_code == 200
        data = response.json()
        assert "repo_id" in data
        assert len(data["repo_id"]) > 0

    def test_demo_response_has_diagram(self):
        response = client.post("/api/analyze", json={"git_url": "demo"})
        data = response.json()
        assert "diagram" in data

    def test_invalid_url_returns_400(self):
        response = client.post("/api/analyze", json={"git_url": "http://internal.corp/secret"})
        assert response.status_code == 400

    def test_invalid_url_error_message(self):
        response = client.post("/api/analyze", json={"git_url": "http://malicious.example.com/repo"})
        assert "Invalid repository URL" in response.json()["detail"]


class TestReposEndpoint:
    def test_repos_returns_list(self):
        response = client.get("/api/repos")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
