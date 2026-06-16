# Test cloning and parsing fastapi repository
import os
import shutil
import git
from parser import RepositoryParser

repo_url = "https://github.com/fastapi/fastapi"
local_path = "cloned_repos/test_fastapi_clone"

if os.path.exists(local_path):
    print("Cleaning up existing clone path...")
    shutil.rmtree(local_path, ignore_errors=True)

print(f"Cloning {repo_url} with depth=1...")
try:
    git.Repo.clone_from(repo_url, local_path, depth=1)
    print("[+] Cloned successfully.")
except Exception as e:
    print(f"[-] Clone failed: {e}")
    exit(1)

print("Running parser.scan() on cloned repository...")
try:
    parser = RepositoryParser(local_path)
    parser.scan()
    print(f"[+] Scan completed successfully.")
    print(f"[+] Total files parsed: {parser.stats['total_files']}")
    print(f"[+] Total lines parsed: {parser.stats['total_lines']}")
    print(f"[+] Languages detected: {parser.stats['languages']}")
    
    # Print some parsed files
    print("\nAPI Routes discovered (first 5):")
    routes = [f for f, t in parser.component_types.items() if t == 'API/Route']
    for r in routes[:5]:
        print(f"  - {r}")
        
    print("\nDatabase/Model elements discovered (first 5):")
    dbs = [f for f, t in parser.component_types.items() if 'Database' in t or 'Model' in t]
    for d in dbs[:5]:
        print(f"  - {d}")
        
except Exception as e:
    print(f"[-] Parsing failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Clean up
shutil.rmtree(local_path, ignore_errors=True)
print("\n[+] Done.")
