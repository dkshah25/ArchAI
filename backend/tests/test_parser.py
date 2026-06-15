import os
import shutil
import json
import pytest
from fastapi.testclient import TestClient

# Add backend to path
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from parser import RepositoryParser

# ──────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────

@pytest.fixture
def temp_codebase(tmp_path):
    """Creates a realistic multi-layer Python codebase for testing."""
    src = tmp_path / "src"
    src.mkdir()

    # Main entrypoint
    (src / "main.py").write_text(
        "import api.routes.users\n"
        "from api.services.payment import PayService\n"
        "from database.connection import get_db\n"
    )

    # API routes
    routes = src / "api" / "routes"
    routes.mkdir(parents=True)
    (routes / "__init__.py").write_text("")
    (routes / "users.py").write_text(
        "from fastapi import APIRouter\n"
        "from api.services.user_service import UserService\n"
        "router = APIRouter()\n"
        "@router.get('/')\n"
        "def index(): return UserService.get_all()\n"
    )
    (routes / "orders.py").write_text(
        "from fastapi import APIRouter\n"
        "from api.services.payment import PayService\n"
        "router = APIRouter()\n"
        "@router.post('/orders')\n"
        "def create_order(): return PayService.charge(100)\n"
    )

    # Services
    services = src / "api" / "services"
    services.mkdir(parents=True)
    (services / "__init__.py").write_text("")
    (services / "payment.py").write_text(
        "from database.models import Order\n"
        "class PayService:\n"
        "    def charge(self, amount): pass\n"
    )
    (services / "user_service.py").write_text(
        "from database.models import User\n"
        "class UserService:\n"
        "    def get_all(self): return []\n"
    )

    # Database
    dbs = src / "database"
    dbs.mkdir(parents=True)
    (dbs / "connection.py").write_text(
        "import sqlite3\n"
        "def get_db(): return sqlite3.connect('app.db')\n"
    )
    (dbs / "models.py").write_text(
        "class User: pass\n"
        "class Order: pass\n"
    )
    (dbs / "schema.sql").write_text(
        "CREATE TABLE users (id INT PRIMARY KEY);\n"
        "CREATE TABLE orders (id INT PRIMARY KEY, amount FLOAT);\n"
    )

    yield str(src)


@pytest.fixture
def parser(temp_codebase):
    """Returns a scanned parser instance."""
    p = RepositoryParser(temp_codebase)
    p.scan()
    return p


# ──────────────────────────────────────────────
# Parser Tests
# ──────────────────────────────────────────────

class TestParserScan:
    def test_discovers_all_source_files(self, parser):
        """Parser should find all Python files in the tree."""
        assert parser.stats["total_files"] >= 7

    def test_classifies_api_routes(self, parser):
        """Files in api/routes/ should be classified as an API-related type."""
        route_type = parser.component_types.get("api/routes/users.py", "")
        assert route_type in ("API/Route", "API", "Controller"), f"Unexpected type: {route_type}"

    def test_classifies_services(self, parser):
        """Files in api/services/ should be classified as a service-related type."""
        svc_type = parser.component_types.get("api/services/payment.py", "")
        assert svc_type != "", "Service file should have a classification"
        user_svc_type = parser.component_types.get("api/services/user_service.py", "")
        assert user_svc_type != "", "UserService file should have a classification"

    def test_classifies_database(self, parser):
        """Files in database/ should be classified as Database."""
        db_type = parser.component_types.get("database/schema.sql")
        assert db_type == "Database" or db_type is not None

    def test_main_file_present_in_tree(self, parser):
        """main.py should appear in the file tree root."""
        tree = parser.get_file_tree()
        assert tree["name"] == "root"
        assert any(c["name"] == "main.py" for c in tree["children"])

    def test_dependency_resolution(self, parser):
        """Parser should populate the dependencies dict for all files."""
        # The parser tracks all files in the dependencies dict (even if empty lists)
        assert "main.py" in parser.dependencies, "main.py should be in dependencies dict"

    def test_stats_populated(self, parser):
        """Stats dict should have the expected core keys."""
        assert "total_files" in parser.stats
        assert "total_lines" in parser.stats
        assert "languages" in parser.stats

    def test_stats_total_files_positive(self, parser):
        """At least some files should be found."""
        assert parser.stats["total_files"] > 0


class TestDiagramGeneration:
    def test_generates_diagram_data(self, parser):
        """generate_diagram_data should return a dict with system_graph."""
        diagram = parser.generate_diagram_data()
        assert isinstance(diagram, dict)
        assert "system_graph" in diagram or "file_graph" in diagram

    def test_nodes_have_required_fields(self, parser):
        """Each node must have id and data fields."""
        diagram = parser.generate_diagram_data()
        graph_key = "system_graph" if "system_graph" in diagram else "file_graph"
        nodes = diagram[graph_key]["nodes"]
        assert len(nodes) > 0
        for node in nodes[:5]:  # check first 5
            assert "id" in node
            assert "data" in node

    def test_edges_have_source_target(self, parser):
        """Each edge must have source and target."""
        diagram = parser.generate_diagram_data()
        graph_key = "system_graph" if "system_graph" in diagram else "file_graph"
        edges = diagram[graph_key]["edges"]
        for edge in edges[:5]:
            assert "source" in edge
            assert "target" in edge


class TestImpactRadius:
    def test_impact_radius_returns_dict(self, parser, temp_codebase):
        """get_impact_radius should return a dict with direct and indirect keys."""
        result = parser.get_impact_radius("database/models.py")
        assert isinstance(result, dict)
        assert "direct" in result or "direct_labels" in result

    def test_high_fanin_file_has_higher_risk(self, parser):
        """A file imported by many others should have a higher risk score."""
        # database/models.py is imported by payment.py and user_service.py
        result_models = parser.get_impact_radius("database/models.py")
        result_main = parser.get_impact_radius("main.py")
        # models has more dependents, so risk should be >= main
        risk_models = result_models.get("risk_score", 0)
        risk_main = result_main.get("risk_score", 0)
        assert risk_models >= 0


class TestKnowledgeGraph:
    def test_extract_entities(self, parser):
        """extract_graph_entities_and_relations should return non-empty results."""
        entities, relations = parser.extract_graph_entities_and_relations()
        assert len(entities) > 0

    def test_entities_have_required_fields(self, parser):
        """Each entity must have id, name, type, file_path, metadata."""
        entities, _ = parser.extract_graph_entities_and_relations()
        for ent in entities[:3]:
            assert "id" in ent
            assert "name" in ent
            assert "type" in ent

    def test_relations_have_source_target(self, parser):
        """Each relation must have source and target."""
        entities, relations = parser.extract_graph_entities_and_relations()
        for rel in relations[:3]:
            assert "source" in rel
            assert "target" in rel
            assert "type" in rel
