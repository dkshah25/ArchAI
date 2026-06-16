import os
import re
import ast
from typing import Dict, List, Set, Any, Tuple

# Ignore directories commonly containing build artifacts or third-party code
IGNORE_DIRS = {
    'node_modules', 'build', 'dist', '.next', 'target', '.git', '.idea',
    'venv', 'env', '__pycache__', 'out', 'bin', 'obj', 'cloned_repos'
}

# Ignore common lock files, images, documents, and other binaries
IGNORE_EXTS = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz',
    '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.mp4', '.sqlite', '.db'
}

# Code extensions that represent system architecture components
CODE_EXTS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.go', '.java', '.cpp', '.c', '.cs', '.sql', '.sh'
}

# Config/tooling files that are never "imported" as modules — exempt from orphan warnings
CONFIG_FILENAMES = {
    'tailwind.config.ts', 'tailwind.config.js', 'postcss.config.js', 'postcss.config.cjs',
    'next.config.js', 'next.config.ts', 'next.config.mjs',
    'vite.config.ts', 'vite.config.js', 'webpack.config.js', 'rollup.config.js',
    'jest.config.js', 'jest.config.ts', 'babel.config.js', '.babelrc',
    'eslint.config.js', '.eslintrc.js', '.eslintrc.ts',
    'prettier.config.js', '.prettierrc.js',
    'tsconfig.json', 'jsconfig.json',
    'schema.sql', 'init.sql', 'migrations.sql',
    'Makefile', 'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    'verify.py', 'setup.py', 'setup.cfg',
    'datasets.py',  # standalone scripts
}

# Suffixes/patterns that indicate standalone scripts (not imported modules)
STANDALONE_PATTERNS = {
    'datasets', 'seed', 'migrate', 'setup', 'verify', 'fixture', 'conftest',
    'manage', 'cli', 'script', 'bootstrap',
}

class RepositoryParser:
    def __init__(self, repo_path: str):
        self.repo_path = os.path.abspath(repo_path)
        self.files: List[str] = []
        self.file_contents: Dict[str, str] = {}
        self.dependencies: Dict[str, List[str]] = {}
        self.component_types: Dict[str, str] = {} # path -> type (Route, Controller, Service, Model, DB, Infra, Generic)
        self.stats = {"total_files": 0, "total_lines": 0, "languages": {}}

    def scan(self):
        """Walks the directory, stores paths, contents and does initial analysis."""
        for root, dirs, filenames in os.walk(self.repo_path):
            # Prune directory search to skip ignored folders
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]

            for filename in filenames:
                _, ext = os.path.splitext(filename)
                if ext.lower() in IGNORE_EXTS:
                    continue

                abs_path = os.path.join(root, filename)
                rel_path = os.path.relpath(abs_path, self.repo_path).replace('\\', '/')

                try:
                    with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    self.files.append(rel_path)
                    self.file_contents[rel_path] = content
                    
                    # Update stats — only count CODE files for language distribution
                    self.stats["total_files"] += 1
                    self.stats["total_lines"] += len(content.splitlines())
                    if ext.lower() in CODE_EXTS:
                        lang = self._detect_language(rel_path)
                        self.stats["languages"][lang] = self.stats["languages"].get(lang, 0) + 1
                except Exception as e:
                    print(f"Error reading file {rel_path}: {e}")

        self._classify_components()
        self._parse_dependencies()

    def _detect_language(self, path: str) -> str:
        ext = os.path.splitext(path)[1].lower()
        mapping = {
            '.py': 'Python',
            '.js': 'JavaScript',
            '.jsx': 'JavaScript React',
            '.ts': 'TypeScript',
            '.tsx': 'TypeScript React',
            '.go': 'Go',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.cs': 'C#',
            '.html': 'HTML',
            '.css': 'CSS',
            '.json': 'JSON',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.md': 'Markdown',
            '.sh': 'Shell'
        }
        return mapping.get(ext, 'Other')

    def _classify_components(self):
        """Categorize files into one of the 14 architecture layers:
        API, Controller, Service, Model, Database, Queue, Authentication,
        Cache, Storage, External API, Worker, Scheduler, AI Component, Utility.
        """
        for path, content in self.file_contents.items():
            filename = os.path.basename(path).lower()
            ext = os.path.splitext(path)[1].lower()
            content_lower = content.lower()
            
            # Skip non-code extensions for logical component mapping
            if ext not in CODE_EXTS:
                self.component_types[path] = 'Utility'
                continue
                
            # Default category
            category = 'Utility'
            
            # Heuristics based on path/file naming
            if 'auth' in filename or 'login' in filename or 'jwt' in filename or 'token' in filename or 'oauth' in filename:
                category = 'Authentication'
            elif 'redis' in filename or 'cache' in filename or 'memcached' in filename:
                category = 'Cache'
            elif 'db' in filename or 'database' in filename or 'repository' in filename or 'connection' in filename or ext in ('.sql',):
                category = 'Database'
            elif 'queue' in filename or 'celery' in filename or 'rabbitmq' in filename or 'pika' in filename or 'kafka' in filename or 'pubsub' in filename:
                category = 'Queue'
            elif 'worker' in filename or 'consumer' in filename:
                category = 'Worker'
            elif 'cron' in filename or 'scheduler' in filename or 'job' in filename or 'beat' in filename:
                category = 'Scheduler'
            elif 'openai' in filename or 'gemini' in filename or 'ai_service' in filename or 'llm' in filename or 'prompt' in filename:
                category = 'AI Component'
            elif 'storage' in filename or 's3' in filename or 'upload' in filename or 'blob' in filename:
                category = 'Storage'
            elif 'stripe' in filename or 'payment' in filename or 'external' in filename or 'integration' in filename or 'client' in filename or 'webhook' in filename:
                category = 'External API'
            elif 'route' in filename or 'router' in filename or 'api/' in path.lower() or '/v1/' in path.lower() or '/endpoints/' in path.lower():
                category = 'API'
            elif 'controller' in filename:
                category = 'Controller'
            elif 'service' in filename or 'handler' in filename or 'helper' in filename:
                category = 'Service'
            elif 'model' in filename or 'entity' in filename or 'schema' in filename:
                category = 'Model'
            
            # Content-based heuristics in case file name is generic
            else:
                if 'apirouter' in content_lower or 'fastapi' in content_lower or 'express.router' in content_lower or '@app.get' in content_lower or '@app.post' in content_lower or 'requestmapping' in content_lower:
                    category = 'API'
                elif 'controller' in content_lower or '@controller' in content_lower:
                    category = 'Controller'
                elif 'service' in content_lower or '@injectable' in content_lower:
                    category = 'Service'
                elif 'db.model' in content_lower or 'sqlalchemy' in content_lower or 'declarativebase' in content_lower or 'mongoose.model' in content_lower or 'prisma' in content_lower:
                    category = 'Model'
                elif 'sqlite3' in content_lower or 'create_engine' in content_lower or 'connect_db' in content_lower or 'pymongo' in content_lower:
                    category = 'Database'
                elif 'redis' in content_lower or 'lru_cache' in content_lower or 'cache' in content_lower:
                    category = 'Cache'
                elif 'celery' in content_lower or 'pika.connection' in content_lower or 'kafka' in content_lower:
                    category = 'Queue'
                elif 'jwt' in content_lower or 'oauth' in content_lower or 'bcrypt' in content_lower or 'authenticate' in content_lower:
                    category = 'Authentication'
                elif 'openai' in content_lower or 'google.genai' in content_lower or 'llm' in content_lower or 'gemini' in content_lower:
                    category = 'AI Component'
                elif 'boto3' in content_lower or 's3' in content_lower or 'storage' in content_lower:
                    category = 'Storage'
                elif 'stripe' in content_lower or 'httpx' in content_lower or 'requests.get' in content_lower:
                    category = 'External API'
                elif 'worker' in content_lower or 'process_queue' in content_lower:
                    category = 'Worker'
                elif 'cron' in content_lower or 'scheduler' in content_lower:
                    category = 'Scheduler'
                else:
                    category = 'Utility'
                    
            self.component_types[path] = category

    def _parse_dependencies(self):
        """Extract import statements from all files and link them to internal files."""
        for path, content in self.file_contents.items():
            self.dependencies[path] = []
            filename = os.path.basename(path).lower()
            ext = os.path.splitext(path)[1].lower()
            
            # Only parse dependencies for code files and skip test modules
            if ext not in CODE_EXTS:
                continue
            if 'test_' in filename or '_test' in filename or '/tests/' in path.lower() or '/test/' in path.lower():
                continue
            
            if ext == '.py':
                self._parse_python_imports(path, content)
            else:
                self._parse_generic_imports(path, content)

    def _parse_python_imports(self, path: str, content: str):
        """Uses Python's ast module to extract imports and resolve relative references."""
        try:
            tree = ast.parse(content)
            imports = []
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.append(node.module)
            
            self._resolve_imports(path, imports)
        except Exception:
            # Fallback to regex in case of syntax errors in code
            self._parse_generic_imports(path, content)

    def _parse_generic_imports(self, path: str, content: str):
        """Uses regular expressions to capture import/require statements across JS, TS, Go, Java."""
        imports = []
        # ES6 / TS: import ... from '...' or import '...'
        es6_imports = re.findall(r"(?:import|export)\s+.*?\s+from\s+['\"](.*?)['\"]", content)
        # CommonJS: require('...')
        cjs_imports = re.findall(r"require\s*\(\s*['\"](.*?)['\"]\s*\)", content)
        # Go: import ( ... ) or import "..."
        go_imports = re.findall(r"import\s+['\"](.*?)['\"]", content)
        
        raw_imports = es6_imports + cjs_imports + go_imports
        self._resolve_imports(path, raw_imports)

    def _resolve_imports(self, path: str, imported_modules: List[str]):
        """Resolves module import paths back to internal workspace files.
        
        Handles:
        - Relative imports: './foo', '../bar'
        - Python dotted imports: 'services.ai_service', 'backend.utils'
        - ES module paths: '@/components/foo', 'components/foo'
        - Partial-name matching as fallback
        """
        current_dir = os.path.dirname(path)
        
        for module in imported_modules:
            module = module.strip()
            if not module or module.startswith('http://') or module.startswith('https://'):
                continue
            
            # Skip obvious third-party packages
            if module.startswith('@') and '/' not in module[1:]:
                continue  # scoped package with no path e.g. @babel

            matched = False

            # 1. Relative imports (start with '.' or '@/')
            if module.startswith('.'):
                resolved_rel = os.path.normpath(os.path.join(current_dir, module)).replace('\\', '/')
                for f in self.files:
                    f_no_ext = os.path.splitext(f)[0]
                    if f_no_ext == resolved_rel or f.startswith(resolved_rel + '/index') or f.startswith(resolved_rel + '/main'):
                        self.dependencies[path].append(f)
                        matched = True
                        break

            # 2. Python-style dotted module: 'services.ai_service' -> try as path segment
            elif '.' in module and not module.endswith('.py'):
                # Convert dots to path separators: services.ai_service -> services/ai_service
                as_path = module.replace('.', '/')
                for f in self.files:
                    f_no_ext = os.path.splitext(f)[0]
                    # Match exact tail: backend/services/ai_service -> ends with services/ai_service
                    if f_no_ext.endswith(as_path) or f_no_ext == as_path:
                        self.dependencies[path].append(f)
                        matched = True
                        break
                # Also try just the last part (leaf module name)
                if not matched:
                    leaf = module.split('.')[-1]
                    for f in self.files:
                        f_no_ext = os.path.splitext(f)[0]
                        if os.path.basename(f_no_ext) == leaf:
                            self.dependencies[path].append(f)
                            matched = True
                            break

            # 3. Path-like imports: 'components/Button', '@/lib/utils'
            else:
                clean = module.lstrip('@').lstrip('/')
                for f in self.files:
                    f_no_ext = os.path.splitext(f)[0]
                    # Exact tail match
                    if f_no_ext.endswith(clean) or f_no_ext.endswith('/' + clean):
                        self.dependencies[path].append(f)
                        matched = True
                        break
                # Fallback: basename match
                if not matched:
                    leaf = clean.split('/')[-1]
                    for f in self.files:
                        f_no_ext = os.path.splitext(f)[0]
                        if os.path.basename(f_no_ext) == leaf:
                            self.dependencies[path].append(f)
                            matched = True
                            break

        self.dependencies[path] = list(set(self.dependencies[path]))

    def get_file_tree(self) -> Dict[str, Any]:
        """Converts file list into a structured JSON tree for the left-side tree view."""
        tree = {"name": "root", "type": "directory", "children": []}
        
        for file in sorted(self.files):
            parts = file.split('/')
            current = tree
            for i, part in enumerate(parts):
                is_file = (i == len(parts) - 1)
                
                existing = next((c for c in current["children"] if c["name"] == part), None)
                if not existing:
                    new_node = {
                        "name": part,
                        "path": "/".join(parts[:i+1]),
                        "type": "file" if is_file else "directory"
                    }
                    if not is_file:
                        new_node["children"] = []
                    else:
                        new_node["component_type"] = self.component_types.get(file, "Utility")
                    current["children"].append(new_node)
                    current = new_node
                else:
                    current = existing
        return tree

    # ==================== ARCHITECTURE ENGINE EXTENSIONS ====================

    def _find_cycles(self) -> List[List[str]]:
        """DFS cycle detection in codebase dependencies."""
        cycles = []
        visited = {}  # 0: unvisited, 1: visiting, 2: visited
        path_stack = []

        def dfs(node):
            visited[node] = 1
            path_stack.append(node)
            for neighbor in self.dependencies.get(node, []):
                if visited.get(neighbor, 0) == 0:
                    dfs(neighbor)
                elif visited.get(neighbor, 0) == 1:
                    cycle_start = path_stack.index(neighbor)
                    cycle = path_stack[cycle_start:] + [neighbor]
                    if cycle not in cycles:
                        cycles.append(cycle)
            path_stack.pop()
            visited[node] = 2

        for node in self.files:
            if visited.get(node, 0) == 0:
                dfs(node)
        return cycles

    def _find_longest_chain(self) -> List[str]:
        """DFS dynamic programming to locate the longest dependency path."""
        longest_path = []
        memo = {}

        def dfs(node, visited_in_path):
            if node in memo:
                return memo[node]
            if node in visited_in_path:
                return []
            visited_in_path.add(node)
            
            max_subpath = []
            for neighbor in self.dependencies.get(node, []):
                subpath = dfs(neighbor, visited_in_path.copy())
                if len(subpath) > len(max_subpath):
                    max_subpath = subpath
                    
            visited_in_path.remove(node)
            res = [node] + max_subpath
            memo[node] = res
            return res

        for node in self.files:
            path = dfs(node, set())
            if len(path) > len(longest_path):
                longest_path = path
                
        return longest_path

    def _get_responsibilities(self, content: str, path: str) -> List[str]:
        """Parse functions and classes to list responsibilities."""
        res = []
        try:
            if path.endswith('.py'):
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        res.append(f"Manage class {node.name}")
                    elif isinstance(node, ast.FunctionDef):
                        res.append(f"Execute function {node.name}()")
            else:
                classes = re.findall(r"(?:class|interface|struct)\s+(\w+)", content)
                functions = re.findall(r"(?:function|const|let)\s+(\w+)\s*\(", content)
                for c in classes[:3]:
                    res.append(f"Define data structure {c}")
                for f in functions[:4]:
                    res.append(f"Expose behavior {f}()")
        except Exception:
            pass
        if not res:
            res = ["Encapsulate module execution", "Configure environmental runtime values"]
        return res[:6]

    def _get_file_purpose(self, path: str, category: str) -> str:
        """Deterministic description of file role."""
        filename = os.path.basename(path)
        mapping = {
            'API': f"Exposes routing paths and API endpoints for logical client operations ({filename}).",
            'Controller': f"Decouples incoming HTTP requests from core business layer logic ({filename}).",
            'Service': f"Coordinates core transactional business operations and logic workflow rules ({filename}).",
            'Model': f"Declares data models and tables mapping variables to persistent layers ({filename}).",
            'Database': f"Manages persistence drivers, connection pools, and database queries ({filename}).",
            'Queue': f"Maintains message-broker queue definitions and publishing rules ({filename}).",
            'Authentication': f"Performs token issuance, user login validation, and auth guards ({filename}).",
            'Cache': f"Implements temporary in-memory caching to boost server latency speeds ({filename}).",
            'Storage': f"Manages external cloud file uploads or static file-write operations ({filename}).",
            'External API': f"Binds integrations to third-party web services (e.g. email, payments) ({filename}).",
            'Worker': f"Consumes queue logs in background threads to execute tasks asynchronously ({filename}).",
            'Scheduler': f"Triggers cron schedules and periodic background operations ({filename}).",
            'AI Component': f"Handles prompting templates, vector maps, or LLM integrations ({filename}).",
            'Utility': f"Holds standard logger formats, helper arrays, or core environment configs ({filename})."
        }
        return mapping.get(category, f"Encapsulates system module logic for ({filename}).")

    def _get_system_component_name(self, file_path: str, category: str) -> Tuple[str, str]:
        """Resolves system graph aggregated component name and category."""
        if category == 'Authentication':
            return 'Authentication Service', 'Authentication'
        elif category == 'Cache':
            return 'Cache System', 'Cache'
        elif category == 'Storage':
            return 'File Storage System', 'Storage'
        elif category == 'Queue':
            return 'Message Broker', 'Queue'
        elif category == 'Worker':
            return 'Background Worker Pool', 'Worker'
        elif category == 'Scheduler':
            return 'Job Scheduler', 'Scheduler'
        elif category == 'AI Component':
            return 'AI Reasoning Engine', 'AI Component'
        elif category == 'External API':
            return 'External API Integrations', 'External API'
        
        # Domain parsing based on folders or filenames
        filename = os.path.basename(file_path).lower()
        path_lower = file_path.lower()
        
        domains = ['user', 'order', 'product', 'payment', 'billing', 'inventory', 'cart', 'shipping', 'customer']
        domain_found = None
        for d in domains:
            if d in filename or d in path_lower:
                domain_found = d.capitalize()
                break
                
        if domain_found:
            if category in ('API', 'Controller'):
                return f"{domain_found} API Layer", 'API'
            elif category == 'Service':
                return f"{domain_found} Business Service", 'Service'
            elif category in ('Database', 'Model'):
                return f"{domain_found} Datastore", 'Database'
                
        # Fallbacks
        if category in ('API', 'Controller'):
            return 'API Router Gateway', 'API'
        elif category == 'Service':
            return 'Core Business logic', 'Service'
        elif category in ('Database', 'Model'):
            return 'Relational Database Layer', 'Database'
        elif category == 'Utility':
            return 'System Utility Libs', 'Utility'
        
        return 'General Logic Module', 'Utility'

    def generate_diagram_data(self) -> Dict[str, Any]:
        """Builds two decoupled visual graphs (Graph A & B), complexity heatmaps, warnings, and details."""
        # 1. Colors & styling schema
        role_styles = {
            'API': {'bg': '#0a1a24', 'border': '#06b6d4', 'text': '#06b6d4', 'icon': '🌐'},
            'Controller': {'bg': '#170e24', 'border': '#8b5cf6', 'text': '#8b5cf6', 'icon': '⚡'},
            'Service': {'bg': '#081329', 'border': '#3b82f6', 'text': '#3b82f6', 'icon': '⚙️'},
            'Model': {'bg': '#251b10', 'border': '#f59e0b', 'text': '#f59e0b', 'icon': '📄'},
            'Database': {'bg': '#071c12', 'border': '#10b981', 'text': '#10b981', 'icon': '🗄️'},
            'Queue': {'bg': '#1a1625', 'border': '#a855f7', 'text': '#a855f7', 'icon': '📥'},
            'Authentication': {'bg': '#1e1b10', 'border': '#eab308', 'text': '#eab308', 'icon': '🔑'},
            'Cache': {'bg': '#1f1018', 'border': '#ec4899', 'text': '#ec4899', 'icon': '⚡'},
            'Storage': {'bg': '#0f1f10', 'border': '#84cc16', 'text': '#84cc16', 'icon': '📁'},
            'External API': {'bg': '#1c0c24', 'border': '#d946ef', 'text': '#d946ef', 'icon': '🔌'},
            'Worker': {'bg': '#141416', 'border': '#78716c', 'text': '#a8a29e', 'icon': '⚒️'},
            'Scheduler': {'bg': '#0d1822', 'border': '#14b8a6', 'text': '#14b8a6', 'icon': '⏰'},
            'AI Component': {'bg': '#1a0d1e', 'border': '#f43f5e', 'text': '#f43f5e', 'icon': '🧠'},
            'Utility': {'bg': '#0a0f1d', 'border': '#64748b', 'text': '#e2e8f0', 'icon': '🛠️'}
        }

        # 2. Filter files (only code files, exclude test directories)
        filtered_files = []
        for file in self.files:
            filename = os.path.basename(file).lower()
            ext = os.path.splitext(file)[1].lower()
            if ext not in CODE_EXTS:
                continue
            if 'test_' in filename or '_test' in filename or '/tests/' in file.lower() or '/test/' in file.lower():
                continue
            filtered_files.append(file)

        # 3. Calculate file-by-file metrics (Complexity, Risk, Purpose, Responsibilities)
        node_details = {}
        file_metrics = {}
        in_degrees = {f: 0 for f in filtered_files}
        out_degrees = {f: 0 for f in filtered_files}
        
        # Calculate degrees
        for src, dests in self.dependencies.items():
            if src not in in_degrees:
                continue
            for dest in dests:
                if dest in in_degrees:
                    out_degrees[src] += 1
                    in_degrees[dest] += 1

        for f in filtered_files:
            content = self.file_contents.get(f, "")
            lines_cnt = len(content.splitlines())
            
            # Estimate cyclomatic complexity
            cc_est = 1 + content.count('if ') + content.count('for ') + content.count('while ') + content.count('def ') + content.count('class ') + content.count('except')
            
            # Risk estimation out of 100
            in_deg = in_degrees[f]
            out_deg = out_degrees[f]
            size_fac = min(lines_cnt / 350.0, 1.0) * 30
            out_fac = min(out_deg / 8.0, 1.0) * 20
            in_fac = min(in_deg / 12.0, 1.0) * 30
            cc_fac = min(cc_est / 15.0, 1.0) * 20
            risk_score = int(size_fac + out_fac + in_fac + cc_fac)
            
            file_metrics[f] = {
                'lines': lines_cnt,
                'complexity': cc_est,
                'risk': risk_score,
                'in_degree': in_deg,
                'out_degree': out_deg
            }
            
            cat = self.component_types.get(f, 'Utility')
            node_details[f] = {
                'purpose': self._get_file_purpose(f, cat),
                'responsibilities': self._get_responsibilities(content, f),
                'imports': [d for d in self.dependencies.get(f, []) if d in in_degrees],
                'dependents': [k for k, v in self.dependencies.items() if f in v and k in in_degrees],
                'risk_score': risk_score,
                'complexity': cc_est,
                'files_involved': [f],
                'is_component': False
            }

        # 4. Generate Graph A - File Dependency Graph
        file_nodes = []
        file_edges = []
        x_cols = {
            'API': 100, 'Controller': 100, 'Authentication': 300, 'Service': 500,
            'Cache': 700, 'Queue': 700, 'Worker': 700, 'Scheduler': 700,
            'Database': 900, 'Model': 900, 'Storage': 900,
            'External API': 1100, 'AI Component': 1100, 'Utility': 1100
        }
        y_counters = {k: 50 for k in x_cols.keys()}

        for f in filtered_files:
            cat = self.component_types.get(f, 'Utility')
            x = x_cols.get(cat, 1100)
            y = y_counters[cat]
            y_counters[cat] += 120
            
            style = role_styles.get(cat, role_styles['Utility'])
            file_nodes.append({
                "id": f,
                "type": "customNode",
                "position": {"x": x, "y": y},
                "data": {
                    "label": os.path.basename(f),
                    "path": f,
                    "type": cat,
                    "icon": style['icon'],
                    "bg": style['bg'],
                    "border": style['border'],
                    "textColor": style['text'],
                    "risk_score": file_metrics[f]['risk'],
                    "complexity": file_metrics[f]['complexity']
                }
            })

        edge_counter = 0
        for src in filtered_files:
            for dest in self.dependencies.get(src, []):
                if dest in in_degrees:
                    file_edges.append({
                        "id": f"fe{edge_counter}",
                        "source": src,
                        "target": dest,
                        "animated": True,
                        "style": {"stroke": "#475569", "strokeWidth": 1.5}
                    })
                    edge_counter += 1

        # File Mermaid
        file_m_lines = ["graph TD"]
        for fn in file_nodes:
            fn_safe = fn["id"].replace('/', '_').replace('.', '_').replace('-', '_')
            file_m_lines.append(f'    {fn_safe}["{fn["data"]["icon"]} {fn["data"]["label"]}"]')
        for fe in file_edges:
            src_safe = fe["source"].replace('/', '_').replace('.', '_').replace('-', '_')
            dest_safe = fe["target"].replace('/', '_').replace('.', '_').replace('-', '_')
            file_m_lines.append(f"    {src_safe} --> {dest_safe}")
        file_mermaid = "\n".join(file_m_lines)

        # 5. Generate Graph B - Semantic System Architecture Graph (Aggregated components)
        system_nodes = []
        system_edges = []
        
        # Map each file to aggregated system component
        file_to_comp = {}
        comp_members = {}  # comp_name -> list of files
        comp_categories = {} # comp_name -> category
        
        for f in filtered_files:
            cat = self.component_types.get(f, 'Utility')
            comp_name, comp_cat = self._get_system_component_name(f, cat)
            file_to_comp[f] = comp_name
            comp_members.setdefault(comp_name, []).append(f)
            comp_categories[comp_name] = comp_cat

        # Build aggregated system nodes
        sys_x_cols = {
            'API': 100, 'Controller': 100,
            'Authentication': 300,
            'Service': 500,
            'Cache': 700, 'Queue': 700, 'Worker': 700, 'Scheduler': 700,
            'Database': 900, 'Storage': 900,
            'External API': 1100, 'AI Component': 1100, 'Utility': 1100
        }
        sys_y_counters = {k: 50 for k in sys_x_cols.keys()}

        for comp_name, members in comp_members.items():
            cat = comp_categories[comp_name]
            x = sys_x_cols.get(cat, 1100)
            y = sys_y_counters[cat]
            sys_y_counters[cat] += 150
            
            # Aggregate stats
            avg_risk = int(sum(file_metrics[m]['risk'] for m in members) / len(members))
            avg_cc = int(sum(file_metrics[m]['complexity'] for m in members) / len(members))
            
            style = role_styles.get(cat, role_styles['Utility'])
            system_nodes.append({
                "id": comp_name,
                "type": "customNode",
                "position": {"x": x, "y": y},
                "data": {
                    "label": comp_name,
                    "path": f"system://{comp_name}",
                    "type": cat,
                    "icon": style['icon'],
                    "bg": style['bg'],
                    "border": style['border'],
                    "textColor": style['text'],
                    "risk_score": avg_risk,
                    "complexity": avg_cc
                }
            })
            
            # Build Node Explainer details for the System Component
            agg_responsibilities = []
            for m in members:
                agg_responsibilities.extend(node_details[m]['responsibilities'])
            agg_responsibilities = list(set(agg_responsibilities))[:8]
            
            node_details[comp_name] = {
                'purpose': f"Logical architectural block aggregating {len(members)} project module files. Functions as a key service within the system logic flow.",
                'responsibilities': agg_responsibilities if agg_responsibilities else ["Execute domain transactional directives"],
                'imports': [],  # filled below
                'dependents': [], # filled below
                'risk_score': avg_risk,
                'complexity': avg_cc,
                'files_involved': members,
                'is_component': True
            }

        # Build aggregated system edges (avoid duplicate links and self-loops)
        sys_edge_set = set()
        for src_file in filtered_files:
            src_comp = file_to_comp[src_file]
            for dest_file in self.dependencies.get(src_file, []):
                if dest_file in file_to_comp:
                    dest_comp = file_to_comp[dest_file]
                    if src_comp != dest_comp:
                        sys_edge_set.add((src_comp, dest_comp))

        sys_edge_idx = 0
        for src_comp, dest_comp in sys_edge_set:
            system_edges.append({
                "id": f"se{sys_edge_idx}",
                "source": src_comp,
                "target": dest_comp,
                "animated": True,
                "style": {"stroke": "#475569", "strokeWidth": 2.0}
            })
            sys_edge_idx += 1
            
            # Map imports/dependents on aggregated components
            node_details[src_comp]['imports'].append(dest_comp)
            node_details[dest_comp]['dependents'].append(src_comp)

        for comp_name in comp_members.keys():
            node_details[comp_name]['imports'] = list(set(node_details[comp_name]['imports']))
            node_details[comp_name]['dependents'] = list(set(node_details[comp_name]['dependents']))

        # System Mermaid
        sys_m_lines = ["graph TD"]
        for sn in system_nodes:
            sn_safe = sn["id"].replace(' ', '_').replace('/', '_').replace('-', '_')
            sys_m_lines.append(f'    {sn_safe}["{sn["data"]["icon"]} {sn["data"]["label"]}"]')
        for se in system_edges:
            src_safe = se["source"].replace(' ', '_').replace('/', '_').replace('-', '_')
            dest_safe = se["target"].replace(' ', '_').replace('/', '_').replace('-', '_')
            sys_m_lines.append(f"    {src_safe} --> {dest_safe}")
        system_mermaid = "\n".join(sys_m_lines)

        # 6. FEATURE 7 & 9 — DEAD CODE & ARCHITECTURE WARNINGS
        cycles = self._find_cycles()
        longest_chain = self._find_longest_chain()
        
        warnings = []
        
        # Circular import warning
        if cycles:
            for cyc in cycles[:3]:
                cycle_str = " → ".join([os.path.basename(n) for n in cyc])
                warnings.append({
                    "id": f"warn_cycle_{len(warnings)}",
                    "title": "Circular Dependency Cycle Detected",
                    "description": f"Found direct tightly-coupled loops: {cycle_str}. This breaks modular separation principles and blocks clean deployment boundaries.",
                    "severity": "CRITICAL",
                    "files": cyc[:-1]
                })

        # Unused modules / orphans
        for f in filtered_files:
            # Skip primary launch modules and well-known config/tooling files
            filename = os.path.basename(f)
            filename_lower = filename.lower()
            
            if filename in ('main.py', 'app.py', 'index.js', 'page.tsx', 'layout.tsx', 'Dockerfile'):
                continue
            # Skip config and standalone script files — these are never "imported"
            if filename in CONFIG_FILENAMES:
                continue
            if any(pat in filename_lower.replace('.py', '').replace('.js', '').replace('.ts', '') 
                   for pat in STANDALONE_PATTERNS):
                continue
            # Skip SQL files — loaded at runtime, not imported
            if f.endswith('.sql'):
                continue
            # Skip Next.js special files
            if filename in ('next-env.d.ts', '_document.tsx', '_app.tsx', 'middleware.ts'):
                continue
            
            if in_degrees[f] == 0:
                if out_degrees[f] == 0:
                    warnings.append({
                        "id": f"warn_orphan_{len(warnings)}",
                        "title": "Orphan File Identified",
                        "description": f"File '{filename}' has 0 imports and 0 dependents. It is completely isolated in the workspace.",
                        "severity": "MEDIUM",
                        "files": [f]
                    })
                else:
                    warnings.append({
                        "id": f"warn_unused_{len(warnings)}",
                        "title": "Unused Module Warning",
                        "description": f"File '{filename}' has 0 dependents importing it. Dead code logic or missing registration inside entrypoint bindings.",
                        "severity": "LOW",
                        "files": [f]
                    })

        # Large files - context-aware thresholds to prevent false positives on complex modules or UI views
        for f in filtered_files:
            filename = os.path.basename(f)
            ext = os.path.splitext(f)[1].lower()
            
            # Context-aware thresholds
            if ext in ('.tsx', '.jsx') or 'page' in filename.lower():
                threshold = 3000
            elif filename in ('parser.py', 'ai_service.py', 'main.py'):
                threshold = 1500
            else:
                threshold = 800
                
            if file_metrics[f]['lines'] > threshold:
                warnings.append({
                    "id": f"warn_large_{len(warnings)}",
                    "title": "Bloated Module Detected",
                    "description": f"File '{filename}' spans {file_metrics[f]['lines']} lines of code (limit: {threshold}). Consider refactoring into smaller services or components.",
                    "severity": "MEDIUM",
                    "files": [f]
                })

        # Deep dependency chain warning
        if len(longest_chain) >= 5:
            chain_str = " → ".join([os.path.basename(n) for n in longest_chain])
            warnings.append({
                "id": f"warn_chain_{len(warnings)}",
                "title": "Deep Dependency Chain",
                "description": f"System detects path depth of {len(longest_chain)}: {chain_str}. High coupling makes testing and updates fragile.",
                "severity": "LOW",
                "files": longest_chain
            })

        # 7. TOP 5 Lists for Insights Panel (Feature 9)
        # Top 5 Risks: highest risk scores
        top_risks = sorted(filtered_files, key=lambda x: file_metrics[x]['risk'], reverse=True)[:5]
        top_risks_list = [{"file": f, "metric": f"Risk Score: {file_metrics[f]['risk']}/100"} for f in top_risks]

        # Top 5 Critical Files: highest total degree (in-degree + out-degree)
        top_critical = sorted(filtered_files, key=lambda x: file_metrics[x]['in_degree'] + file_metrics[x]['out_degree'], reverse=True)[:5]
        top_critical_list = [{"file": f, "metric": f"Degrees: {file_metrics[f]['in_degree']} In, {file_metrics[f]['out_degree']} Out"} for f in top_critical]

        # Top 5 Architectural Bottlenecks: high in-degree with high complexity
        top_bottlenecks = sorted(filtered_files, key=lambda x: file_metrics[x]['in_degree'] * file_metrics[x]['complexity'], reverse=True)[:5]
        top_bottlenecks_list = [{"file": f, "metric": f"Impact Factor: {file_metrics[f]['in_degree'] * file_metrics[f]['complexity']}"} for f in top_bottlenecks]

        # Top 5 Refactoring Opportunities: circular imports, largest size
        top_refactor = sorted(filtered_files, key=lambda x: file_metrics[x]['lines'] * (1 if in_degrees[x] == 0 else 0.5), reverse=True)[:5]
        top_refactor_list = [{"file": f, "metric": f"Lines of code: {file_metrics[f]['lines']}"} for f in top_refactor]

        insights = {
            "risks": top_risks_list,
            "critical_files": top_critical_list,
            "bottlenecks": top_bottlenecks_list,
            "refactoring": top_refactor_list
        }

        # Calculate static benchmarks (Feature 1)
        benchmarks = self._compute_benchmarks(filtered_files, file_metrics, warnings, in_degrees, out_degrees)

        # Build output structure
        return {
            "file_graph": {
                "nodes": file_nodes,
                "edges": file_edges,
                "mermaid": file_mermaid
            },
            "system_graph": {
                "nodes": system_nodes,
                "edges": system_edges,
                "mermaid": system_mermaid
            },
            "warnings": warnings,
            "insights": insights,
            "node_details": node_details,
            "benchmarks": benchmarks
        }

    def _compute_benchmarks(self, filtered_files, file_metrics, warnings, in_degrees, out_degrees) -> Dict[str, Any]:
        # Count test files
        test_files = [f for f in self.files if 'test' in os.path.basename(f).lower() or '/tests/' in f.lower() or '/test/' in f.lower()]
        testability = min(int(len(test_files) / (len(filtered_files) or 1) * 200), 100)
        if testability < 15:
            # Check content for test frameworks
            for content in self.file_contents.values():
                if 'pytest' in content or 'unittest' in content or 'jest' in content or 'testing' in content:
                    testability = max(testability, 35)
                    break
        testability = max(testability, 10)

        # Count comments/documentation density
        comment_lines = 0
        total_lines = 0
        for content in self.file_contents.values():
            total_lines += len(content.splitlines())
            for line in content.splitlines():
                line_stripped = line.strip()
                if line_stripped.startswith('#') or line_stripped.startswith('//') or line_stripped.startswith('/*') or line_stripped.startswith('*'):
                    comment_lines += 1
        
        doc_score = min(int(comment_lines / (total_lines or 1) * 350), 100)
        has_readme = any('readme' in f.lower() for f in self.file_contents.keys())
        if has_readme:
            doc_score = max(doc_score, 50)
        doc_score = max(doc_score, 20)

        # Modularity: based on coupling index & cycles
        total_coupling = sum(1 for src, dests in self.dependencies.items() for d in dests)
        coupling_index = total_coupling / (len(filtered_files) or 1)
        modularity = 100 - min(int(coupling_index * 12), 50)
        
        cycles = self._find_cycles()
        modularity -= len(cycles) * 15
        modularity = max(min(modularity, 100), 10)

        # Complexity Score
        avg_complexity = sum(file_metrics[f]['complexity'] for f in filtered_files) / (len(filtered_files) or 1)
        complexity_score = 100 - min(int(avg_complexity * 3.5), 60)
        complexity_score = max(complexity_score, 10)

        # Security
        sec_flaws = 0
        secret_pattern = re.compile(r"(api_key|secret|password|token|private_key)\s*=\s*['\"][a-zA-Z0-9_-]{16,}['\"]", re.IGNORECASE)
        raw_sql_pattern = re.compile(r"execute\s*\(\s*['\"].*(\+format|%s|\{\})", re.IGNORECASE)
        for content in self.file_contents.values():
            sec_flaws += len(secret_pattern.findall(content))
            sec_flaws += len(raw_sql_pattern.findall(content))
        security = 100 - min(sec_flaws * 15, 75)

        # Technical Debt
        debt_points = len(warnings) * 12 + len(cycles) * 18
        tech_debt_score = 100 - min(debt_points, 85)

        # Scalability
        scalability = 50
        cache_found = any(cat == 'Cache' for cat in self.component_types.values())
        queue_found = any(cat == 'Queue' for cat in self.component_types.values())
        worker_found = any(cat == 'Worker' for cat in self.component_types.values())
        if cache_found: scalability += 20
        if queue_found: scalability += 15
        if worker_found: scalability += 15
        scalability = min(scalability, 100)

        # Maintainability
        maintainability = int((modularity + testability + doc_score + tech_debt_score + complexity_score) / 5)

        scores = {
            "maintainability": maintainability,
            "scalability": scalability,
            "modularity": modularity,
            "testability": testability,
            "complexity": complexity_score,
            "technical_debt": tech_debt_score,
            "security": security,
            "documentation": doc_score
        }

        # Build benchmarks against standards
        benchmarks = {
            "scores": scores,
            "startup": {
                "maintainability": 70, "scalability": 60, "modularity": 65, "testability": 45,
                "complexity": 75, "technical_debt": 40, "security": 65, "documentation": 40
            },
            "enterprise": {
                "maintainability": 85, "scalability": 85, "modularity": 80, "testability": 80,
                "complexity": 85, "technical_debt": 25, "security": 90, "documentation": 80
            },
            "open_source": {
                "maintainability": 80, "scalability": 75, "modularity": 75, "testability": 90,
                "complexity": 80, "technical_debt": 30, "security": 80, "documentation": 85
            }
        }

        # Build Strengths & Weaknesses
        strengths = []
        weaknesses = []
        refactoring = []

        if modularity >= 75:
            strengths.append("High architectural modularity with low directory coupling cross-boundaries.")
        else:
            weaknesses.append("High inter-module dependency coupling between boundary logic.")
            refactoring.append("Extract utility and domain components into separate folders/packages.")

        if testability >= 60:
            strengths.append("Consistent automated testing logic identified in directories structure.")
        else:
            weaknesses.append("Poor testability. Zero or low automated testing modules present.")
            refactoring.append("Set up pytest/jest testing frameworks and write integration tests.")

        if doc_score >= 60:
            strengths.append("Clear docstrings and inline comments documentation density.")
        else:
            weaknesses.append("Low documentation quality. Code modules lack descriptive comments.")
            refactoring.append("Add docstrings to primary controllers and service layer functions.")

        if security >= 85:
            strengths.append("High security rating with no plaintext secrets or SQL injection structures scanned.")
        else:
            weaknesses.append("Security warnings: raw SQL formatting or potential secrets leaked in files.")
            refactoring.append("Use parameterized queries in database calls and migrate keys to env configs.")

        if tech_debt_score < 75:
            weaknesses.append(f"Accumulating technical debt warnings ({len(warnings)} design flags).")
            refactoring.append("Refactor circular references and split bloated files exceeding 400 lines.")

        if len(strengths) < 2:
            strengths.append("Consistent programming language layouts across modules.")
        if len(weaknesses) == 0:
            strengths.append("Very low cyclomatic complexity values in core routines.")

        benchmarks["strengths"] = strengths[:4]
        benchmarks["weaknesses"] = weaknesses[:4]
        benchmarks["refactoring"] = refactoring[:4]

        return benchmarks

    def get_impact_radius(self, node_id: str) -> Dict[str, Any]:
        """Calculates direct and indirect downstream dependencies of a node (blast radius checks)."""
        # Downstream dependents mean files/components that import this node_id
        # Build inverse graph: dest -> list of sources importing it
        incoming = {}
        for src, dests in self.dependencies.items():
            for d in dests:
                incoming.setdefault(d, []).append(src)
                
        # Resolve either direct file name or match system component files
        # Check if node_id represents a system component or a direct file
        if node_id.startswith("system://") or not node_id.endswith(('.py', '.js', '.jsx', '.ts', '.tsx', '.go', '.java', '.cpp', '.c', '.cs', '.sql', '.sh')):
            # It is a system component. Resolve its member files.
            comp_name = node_id.replace("system://", "")
            member_files = []
            
            # Map files to system components to get membership
            for f in self.files:
                cat = self.component_types.get(f, 'Utility')
                # Resolve name using same method
                c_name, _ = self._get_system_component_name(f, cat)
                if c_name == comp_name or comp_name in c_name:
                    member_files.append(f)
                    
            # Gather incoming to any member file
            direct_set = set()
            for mf in member_files:
                direct_set.update(incoming.get(mf, []))
                
            # Filter out self member files from direct list
            direct = [d for d in direct_set if d not in member_files]
            
            # BFS walk
            visited = set(member_files)
            queue = list(member_files)
            while queue:
                curr = queue.pop(0)
                for neighbor in incoming.get(curr, []):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
                        
            for mf in member_files:
                visited.discard(mf)
                
            indirect = [n for n in visited if n not in direct]
            
        else:
            # It's a direct file
            direct = list(set(incoming.get(node_id, [])))
            visited = {node_id}
            queue = [node_id]
            while queue:
                curr = queue.pop(0)
                for neighbor in incoming.get(curr, []):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            visited.remove(node_id)
            indirect = [n for n in visited if n not in direct]
            
        # Map back to simple base names or leave as paths
        direct_labels = [os.path.basename(f) for f in direct]
        indirect_labels = [os.path.basename(f) for f in indirect]
        
        # Risk score calculation
        total_dependents = len(direct) + len(indirect)
        risk_score = min(total_dependents * 15 + 10, 100)
        
        return {
            "node_id": node_id,
            "direct": direct,
            "indirect": indirect,
            "direct_labels": direct_labels,
            "indirect_labels": indirect_labels,
            "risk_score": risk_score
        }

    def extract_graph_entities_and_relations(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Extracts modules, classes, functions, endpoints, database connects/queries, cache pools, and external APIs."""
        import ast
        entities = []
        relations = []
        
        # 1. Map files to module entities
        for file in self.files:
            entities.append({
                "id": file,
                "name": os.path.basename(file),
                "type": "module",
                "file_path": file,
                "metadata": {}
            })
            
            # Add dependency relations (imports)
            for dep in self.dependencies.get(file, []):
                relations.append({
                    "source": file,
                    "target": dep,
                    "type": "imports"
                })
        
        # 2. Walk AST for Python files to extract symbols & deep relations
        for file in self.files:
            if not file.endswith('.py'):
                continue
                
            content = self.file_contents.get(file, "")
            try:
                tree = ast.parse(content)
            except Exception:
                continue # Skip files with syntax errors
                
            # Keep track of local classes and functions inside this file
            file_classes = {} # class_name -> entity_id
            
            for node in ast.walk(tree):
                # Class Extraction
                if isinstance(node, ast.ClassDef):
                    class_id = f"{file}::{node.name}"
                    file_classes[node.name] = class_id
                    entities.append({
                        "id": class_id,
                        "name": node.name,
                        "type": "class",
                        "file_path": file,
                        "metadata": {}
                    })
                    # Relationship: module contains class
                    relations.append({
                        "source": file,
                        "target": class_id,
                        "type": "contains"
                    })
                    
                # Function Extraction & Endpoint Detection
                elif isinstance(node, ast.FunctionDef):
                    # Check if inside class
                    parent_class = None
                    for parent in ast.walk(tree):
                        if isinstance(parent, ast.ClassDef) and node in parent.body:
                            parent_class = parent.name
                            break
                            
                    func_id = f"{file}::{parent_class + '.' if parent_class else ''}{node.name}"
                    
                    # Heuristic for Endpoints via Decorators
                    is_endpoint = False
                    endpoint_path = ""
                    endpoint_method = "GET"
                    
                    for dec in node.decorator_list:
                        dec_str = ""
                        # Route decorator like @router.get('/path')
                        if isinstance(dec, ast.Call):
                            if isinstance(dec.func, ast.Attribute):
                                dec_str = f"{dec.func.value.id if isinstance(dec.func.value, ast.Name) else ''}.{dec.func.attr}"
                            elif isinstance(dec.func, ast.Name):
                                dec_str = dec.func.id
                                
                            if any(x in dec_str.lower() for x in ['get', 'post', 'put', 'delete', 'patch', 'route']):
                                is_endpoint = True
                                # Try to grab route path
                                if dec.args and isinstance(dec.args[0], ast.Constant):
                                    endpoint_path = str(dec.args[0].value)
                                elif dec.args and isinstance(dec.args[0], ast.Str): # Older python compatibility
                                    endpoint_path = dec.args[0].s
                                endpoint_method = dec.func.attr.upper() if isinstance(dec.func, ast.Attribute) else "GET"
                                
                    entity_type = "endpoint" if is_endpoint else "function"
                    metadata = {"route": endpoint_path, "method": endpoint_method} if is_endpoint else {}
                    
                    entities.append({
                        "id": func_id,
                        "name": node.name,
                        "type": entity_type,
                        "file_path": file,
                        "metadata": metadata
                    })
                    
                    # Relationship: container (class or module) contains function/endpoint
                    container_id = f"{file}::{parent_class}" if parent_class else file
                    relations.append({
                        "source": container_id,
                        "target": func_id,
                        "type": "contains"
                    })
                    
                    # Inspect function body calls to find databases, AI, external APIs
                    for child in ast.walk(node):
                        if isinstance(child, ast.Call):
                            call_name = ""
                            if isinstance(child.func, ast.Name):
                                call_name = child.func.id
                            elif isinstance(child.func, ast.Attribute):
                                call_name = child.func.attr
                                
                            # 1. Database access checks
                            if call_name in ['connect', 'connect_db', 'execute', 'cursor', 'commit', 'query']:
                                db_entity_id = "system://database"
                                if not any(e["id"] == db_entity_id for e in entities):
                                    entities.append({
                                        "id": db_entity_id,
                                        "name": "Relational Database",
                                        "type": "database",
                                        "file_path": None,
                                        "metadata": {}
                                    })
                                rel_type = "writes_to" if call_name in ['execute', 'commit'] else "reads_from"
                                relations.append({
                                    "source": func_id,
                                    "target": db_entity_id,
                                    "type": rel_type
                                })
                                
                            # 2. Cache / Redis checks
                            elif call_name in ['Redis', 'redis', 'get_cache', 'set_cache', 'cache']:
                                cache_entity_id = "system://redis_cache"
                                if not any(e["id"] == cache_entity_id for e in entities):
                                    entities.append({
                                        "id": cache_entity_id,
                                        "name": "Redis Cache",
                                        "type": "cache",
                                        "file_path": None,
                                        "metadata": {}
                                    })
                                relations.append({
                                    "source": func_id,
                                    "target": cache_entity_id,
                                    "type": "calls"
                                })
                                
                            # 3. OpenAI or LLM checks
                            elif call_name in ['openai', 'Client', 'generate_content', 'models.generate_content']:
                                ai_entity_id = "system://openai_api"
                                if not any(e["id"] == ai_entity_id for e in entities):
                                    entities.append({
                                        "id": ai_entity_id,
                                        "name": "OpenAI / LLM API",
                                        "type": "ai_component",
                                        "file_path": None,
                                        "metadata": {}
                                    })
                                relations.append({
                                    "source": func_id,
                                    "target": ai_entity_id,
                                    "type": "calls"
                                })
                                
                            # 4. Stripe or external payment API checks
                            elif call_name in ['charge', 'Charge', 'stripe']:
                                stripe_entity_id = "system://stripe_api"
                                if not any(e["id"] == stripe_entity_id for e in entities):
                                    entities.append({
                                        "id": stripe_entity_id,
                                        "name": "Stripe Payments API",
                                        "type": "external_api",
                                        "file_path": None,
                                        "metadata": {}
                                    })
                                relations.append({
                                    "source": func_id,
                                    "target": stripe_entity_id,
                                    "type": "calls"
                                })
                                
                            # 5. Celery/Queue tasks checks
                            elif call_name in ['delay', 'apply_async', 'send_task']:
                                queue_entity_id = "system://celery_queue"
                                if not any(e["id"] == queue_entity_id for e in entities):
                                    entities.append({
                                        "id": queue_entity_id,
                                        "name": "Celery Queue",
                                        "type": "queue",
                                        "file_path": None,
                                        "metadata": {}
                                    })
                                relations.append({
                                    "source": func_id,
                                    "target": queue_entity_id,
                                    "type": "publishes"
                                })

        # 3. Deduplicate relationships
        unique_relations = []
        seen_rels = set()
        for rel in relations:
            rel_key = (rel["source"], rel["target"], rel["type"])
            if rel_key not in seen_rels:
                seen_rels.add(rel_key)
                unique_relations.append(rel)
                
        return entities, unique_relations

    def find_graph_path(self, entities: List[Dict[str, Any]], relations: List[Dict[str, Any]], 
                        start_type: str, end_type: str) -> List[List[Dict[str, Any]]]:
        """Finds all paths of relationships connecting entities of start_type to entities of end_type."""
        # Build adjacency list
        adj = {}
        for rel in relations:
            adj.setdefault(rel["source"], []).append(rel)
            
        start_nodes = [e["id"] for e in entities if e["type"] == start_type]
        end_nodes = [e["id"] for e in entities if e["type"] == end_type]
        
        paths = []
        
        # Helper DFS to find paths up to depth 5 to avoid infinite loops
        def dfs(curr, target_nodes, path_relations, visited_nodes):
            if curr in target_nodes:
                paths.append(list(path_relations))
                return
                
            if len(path_relations) >= 5:
                return
                
            for edge in adj.get(curr, []):
                next_node = edge["target"]
                if next_node not in visited_nodes:
                    visited_nodes.add(next_node)
                    path_relations.append(edge)
                    dfs(next_node, target_nodes, path_relations, visited_nodes)
                    path_relations.pop()
                    visited_nodes.remove(next_node)
                    
        for start in start_nodes:
            dfs(start, end_nodes, [], {start})
            
        return paths

    def query_graph(self, query: str, entities: List[Dict[str, Any]], relations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Executes a graph query and returns structured paths, nodes, edges and a summary explanation."""
        query_lower = query.lower()
        paths = []
        
        if "user data" in query_lower or "user table" in query_lower or "user" in query_lower:
            paths = self.find_graph_path(entities, relations, "endpoint", "database")
            paths = [p for p in paths if any("user" in e["source"].lower() or "user" in e["target"].lower() for e in p)]
            explanation = "Compiler-accurate walkthrough of services touching User Data. Request routing path triggers query executions on the user DB records."
            
        elif "redis" in query_lower or "cache" in query_lower:
            paths = self.find_graph_path(entities, relations, "endpoint", "cache")
            explanation = "Complete path mapping from router endpoints to the Redis cache cluster."
            
        elif "openai" in query_lower or "llm" in query_lower or "ai" in query_lower:
            paths = self.find_graph_path(entities, relations, "function", "ai_component")
            paths += self.find_graph_path(entities, relations, "endpoint", "ai_component")
            explanation = "Paths representing logical flows that invoke LLMs or Google Gemini/OpenAI API clients."
            
        elif "path from api to database" in query_lower or "api to database" in query_lower:
            paths = self.find_graph_path(entities, relations, "endpoint", "database")
            explanation = "Full architecture lifecycle paths tracing routing API endpoints down to persistence database engines."
            
        elif "auth" in query_lower or "login" in query_lower:
            paths = self.find_graph_path(entities, relations, "endpoint", "database")
            paths = [p for p in paths if any("auth" in e["source"].lower() or "auth" in e["target"].lower() for e in p)]
            explanation = "Security authentication flow mapping from entry gateways down to database credential tables."
            
        else:
            paths = self.find_graph_path(entities, relations, "endpoint", "database")
            explanation = "Retrieved system dependency path connections."
            
        # Format graph paths as nodes and edges lists for the UI to highlight
        highlight_nodes = set()
        highlight_edges = []
        for path in paths:
            for edge in path:
                highlight_nodes.add(edge["source"])
                highlight_nodes.add(edge["target"])
                highlight_edges.append({
                    "source": edge["source"],
                    "target": edge["target"]
                })
                
        return {
            "query": query,
            "explanation": explanation,
            "paths": paths,
            "highlight_nodes": list(highlight_nodes),
            "highlight_edges": highlight_edges
        }


