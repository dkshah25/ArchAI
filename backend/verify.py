# ArchAI Verification Script
import os
import sys
import sqlite3
import json

print("=== ArchAI Integration verification ===")

# 1. Verify Database
db_name = "archai_test.db"
if os.path.exists(db_name):
    os.remove(db_name)

print("1. Testing SQLite Schema initialization...")
conn = sqlite3.connect(db_name)
cursor = conn.cursor()

schema_file = os.path.join("database", "schema.sql")
if not os.path.exists(schema_file):
    print("[-] Error: schema.sql missing")
    sys.exit(1)

with open(schema_file, "r") as f:
    schema_sql = f.read()

try:
    cursor.executescript(schema_sql)
    conn.commit()
    print("[+] Database tables initialized successfully.")
except Exception as e:
    print(f"[-] Database table setup failed: {e}")
    sys.exit(1)
finally:
    conn.close()
    if os.path.exists(db_name):
        os.remove(db_name)

# 2. Verify Parser
print("\n2. Testing Code Parser scan heuristics...")
from parser import RepositoryParser
parser = RepositoryParser(".")
parser.scan()

print(f"[+] Scanned: {parser.stats['total_files']} files")
print(f"[+] Total Lines: {parser.stats['total_lines']} lines")
print(f"[+] Detected Languages: {list(parser.stats['languages'].keys())}")

# Check key component mappings
main_type = parser.component_types.get("main.py", "Generic")
parser_type = parser.component_types.get("parser.py", "Generic")
print(f"[+] main.py component classification: {main_type}")
print(f"[+] parser.py component classification: {parser_type}")

# 3. Verify AI Mock fallbacks
print("\n3. Testing AI Service fallbacks...")
from services.ai_service import AIService
ai = AIService()
if ai.is_mock:
    print("[+] AI Service running in Mock mode successfully.")
else:
    print("[+] AI Service running with Gemini API Key.")

summary = ai.generate_summary(["main.py", "parser.py"], {"main.py": "API", "parser.py": "Service"}, {"languages": {"Python": 2}})
if "purpose" in summary or "architecture" in summary:
    print("[+] AI JSON Summary generated successfully.")
else:
    print("[-] Summary Generation Failed.")
    sys.exit(1)

chat_res = ai.chat_about_architecture(["main.py", "parser.py"], {"main.py": "Component", "parser.py": "Service"}, [], "Explain main.py structure")
if "answer" in chat_res and len(chat_res["highlighted_nodes"]) > 0:
    print(f"[+] AI Chat resolved. Highlighted nodes: {chat_res['highlighted_nodes']}")
else:
    print("[-] Chat Resolution Failed.")
    sys.exit(1)

print("\n=== All Integration checks PASSED successfully! ===")
sys.exit(0)
