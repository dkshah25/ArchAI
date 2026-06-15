-- ArchAI Schema Definition
-- Compatible with PostgreSQL/Supabase & SQLite

-- Repositories Table
CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    git_url TEXT NOT NULL,
    main_branch TEXT NOT NULL,
    last_analyzed TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Diagram Versions (keeps history of analyzed commits)
CREATE TABLE IF NOT EXISTS diagram_versions (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL,
    commit_hash TEXT NOT NULL,
    mermaid_code TEXT NOT NULL,
    nodes_json TEXT NOT NULL, -- JSON string of nodes/edges for React Flow
    summary_text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(repo_id) REFERENCES repositories(id) ON DELETE CASCADE
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(repo_id) REFERENCES repositories(id) ON DELETE CASCADE
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    referenced_files TEXT, -- JSON array of file paths
    highlighted_nodes TEXT, -- JSON array of node IDs
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Pull Request Reviews
CREATE TABLE IF NOT EXISTS pr_reviews (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL,
    pr_number INTEGER NOT NULL,
    source_branch TEXT NOT NULL,
    target_branch TEXT NOT NULL,
    impact_report TEXT NOT NULL, -- markdown report
    score_json TEXT NOT NULL, -- JSON object: maintainability, scalability, complexity, risk
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(repo_id) REFERENCES repositories(id) ON DELETE CASCADE
);

-- Copilot System Design Logs
CREATE TABLE IF NOT EXISTS copilot_designs (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    design_markdown TEXT NOT NULL,
    mermaid_code TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Graph Entities Table (Phase 6)
CREATE TABLE IF NOT EXISTS graph_entities (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'module', 'class', 'function', 'endpoint', 'database', 'queue', 'external_api'
    file_path TEXT,
    metadata_json TEXT, -- JSON string holding extra attributes (e.g. methods, tables, api routes)
    FOREIGN KEY(repo_id) REFERENCES repositories(id) ON DELETE CASCADE
);

-- Graph Relations Table (Phase 6)
CREATE TABLE IF NOT EXISTS graph_relations (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'imports', 'calls', 'reads_from', 'writes_to', 'publishes', 'subscribes'
    FOREIGN KEY(repo_id) REFERENCES repositories(id) ON DELETE CASCADE
);

-- ─── Performance Indexes ──────────────────────────────────────────────────────
-- Index all foreign key columns used in WHERE clauses for fast lookups

CREATE INDEX IF NOT EXISTS idx_diagram_versions_repo_id ON diagram_versions(repo_id);
CREATE INDEX IF NOT EXISTS idx_diagram_versions_created_at ON diagram_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_repo_id ON chat_sessions(repo_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_pr_reviews_repo_id ON pr_reviews(repo_id);
CREATE INDEX IF NOT EXISTS idx_graph_entities_repo_id ON graph_entities(repo_id);
CREATE INDEX IF NOT EXISTS idx_graph_entities_name ON graph_entities(name);
CREATE INDEX IF NOT EXISTS idx_graph_relations_repo_id ON graph_relations(repo_id);
CREATE INDEX IF NOT EXISTS idx_graph_relations_source_id ON graph_relations(source_id);
CREATE INDEX IF NOT EXISTS idx_graph_relations_target_id ON graph_relations(target_id);
CREATE INDEX IF NOT EXISTS idx_repositories_last_analyzed ON repositories(last_analyzed DESC);
