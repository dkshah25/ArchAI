"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Folder, 
  File, 
  GitBranch, 
  Terminal, 
  MessageSquare, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Send, 
  Check, 
  Code,
  Search,
  Eye,
  GitPullRequest,
  Clock,
  Compass,
  Cpu,
  ArrowRight,
  Maximize2,
  Trash2,
  History,
  Activity,
  AlertTriangle
} from "lucide-react";

// Dynamically import React Flow on client side only to avoid server-side hydration mismatches
let ReactFlow: any = null;
let Controls: any = null;
let MiniMap: any = null;
let Background: any = null;
try {
  const rf = require("reactflow");
  ReactFlow = rf.default;
  Controls = rf.Controls;
  MiniMap = rf.MiniMap;
  Background = rf.Background;
  require("reactflow/dist/style.css");
} catch (e) {
  console.log("React Flow module loading deferred");
}

// Initial mock project state to ensure immediate usability (the WOW moment under 30 seconds)
const MOCK_FASTAPI_REPO = {
  repo_id: "ecommerce-fastapi-mock-id",
  name: "ecommerce-fastapi-service",
  owner: "archai-templates",
  git_url: "https://github.com/archai-templates/ecommerce-fastapi-service",
  commit_hash: "8f7ab2c1",
  file_tree: {
    name: "root",
    type: "directory",
    children: [
      { name: "main.py", path: "main.py", type: "file", component_type: "Utility" },
      {
        name: "api",
        path: "api",
        type: "directory",
        children: [
          {
            name: "routes",
            path: "api/routes",
            type: "directory",
            children: [
              { name: "users.py", path: "api/routes/users.py", type: "file", component_type: "API" },
              { name: "products.py", path: "api/routes/products.py", type: "file", component_type: "API" },
              { name: "orders.py", path: "api/routes/orders.py", type: "file", component_type: "API" }
            ]
          },
          {
            name: "controllers",
            path: "api/controllers",
            type: "directory",
            children: [
              { name: "user_controller.py", path: "api/controllers/user_controller.py", type: "file", component_type: "Controller" },
              { name: "product_controller.py", path: "api/controllers/product_controller.py", type: "file", component_type: "Controller" },
              { name: "order_controller.py", path: "api/controllers/order_controller.py", type: "file", component_type: "Controller" }
            ]
          },
          {
            name: "services",
            path: "api/services",
            type: "directory",
            children: [
              { name: "payment_service.py", path: "api/services/payment_service.py", type: "file", component_type: "Service" },
              { name: "inventory_service.py", path: "api/services/inventory_service.py", type: "file", component_type: "Service" },
              { name: "unused_helper.py", path: "api/services/unused_helper.py", type: "file", component_type: "Utility" }
            ]
          }
        ]
      },
      {
        name: "database",
        path: "database",
        type: "directory",
        children: [
          { name: "connection.py", path: "database/connection.py", type: "file", component_type: "Database" },
          { name: "models.py", path: "database/models.py", type: "file", component_type: "Model" }
        ]
      },
      { name: "Dockerfile", path: "Dockerfile", type: "file", component_type: "Utility" }
    ]
  },
  diagram: {
    file_graph: {
      nodes: [
        { id: "main.py", type: "customNode", position: { x: 100, y: 50 }, data: { label: "main.py", path: "main.py", type: "Utility", icon: "🛠️", bg: "#0a0f1d", border: "#64748b", textColor: "#e2e8f0", risk_score: 15, complexity: 5 } },
        { id: "api/routes/users.py", type: "customNode", position: { x: 100, y: 170 }, data: { label: "users.py", path: "api/routes/users.py", type: "API", icon: "🌐", bg: "#0a1a24", border: "#06b6d4", textColor: "#06b6d4", risk_score: 75, complexity: 12 } },
        { id: "api/routes/products.py", type: "customNode", position: { x: 100, y: 290 }, data: { label: "products.py", path: "api/routes/products.py", type: "API", icon: "🌐", bg: "#0a1a24", border: "#06b6d4", textColor: "#06b6d4", risk_score: 35, complexity: 8 } },
        { id: "api/routes/orders.py", type: "customNode", position: { x: 100, y: 410 }, data: { label: "orders.py", path: "api/routes/orders.py", type: "API", icon: "🌐", bg: "#0a1a24", border: "#06b6d4", textColor: "#06b6d4", risk_score: 45, complexity: 10 } },
        { id: "api/controllers/user_controller.py", type: "customNode", position: { x: 300, y: 100 }, data: { label: "user_controller.py", path: "api/controllers/user_controller.py", type: "Controller", icon: "⚡", bg: "#170e24", border: "#8b5cf6", textColor: "#8b5cf6", risk_score: 55, complexity: 15 } },
        { id: "api/controllers/product_controller.py", type: "customNode", position: { x: 300, y: 220 }, data: { label: "product_controller.py", path: "api/controllers/product_controller.py", type: "Controller", icon: "⚡", bg: "#170e24", border: "#8b5cf6", textColor: "#8b5cf6", risk_score: 30, complexity: 8 } },
        { id: "api/controllers/order_controller.py", type: "customNode", position: { x: 300, y: 340 }, data: { label: "order_controller.py", path: "api/controllers/order_controller.py", type: "Controller", icon: "⚡", bg: "#170e24", border: "#8b5cf6", textColor: "#8b5cf6", risk_score: 65, complexity: 18 } },
        { id: "api/services/payment_service.py", type: "customNode", position: { x: 500, y: 150 }, data: { label: "payment_service.py", path: "api/services/payment_service.py", type: "Service", icon: "⚙️", bg: "#081329", border: "#3b82f6", textColor: "#3b82f6", risk_score: 82, complexity: 22 } },
        { id: "api/services/inventory_service.py", type: "customNode", position: { x: 500, y: 270 }, data: { label: "inventory_service.py", path: "api/services/inventory_service.py", type: "Service", icon: "⚙️", bg: "#081329", border: "#3b82f6", textColor: "#3b82f6", risk_score: 28, complexity: 9 } },
        { id: "api/services/unused_helper.py", type: "customNode", position: { x: 500, y: 390 }, data: { label: "unused_helper.py", path: "api/services/unused_helper.py", type: "Utility", icon: "🛠️", bg: "#0a0f1d", border: "#64748b", textColor: "#e2e8f0", risk_score: 12, complexity: 3 } },
        { id: "database/connection.py", type: "customNode", position: { x: 900, y: 120 }, data: { label: "connection.py", path: "database/connection.py", type: "Database", icon: "🗄️", bg: "#071c12", border: "#10b981", textColor: "#10b981", risk_score: 60, complexity: 11 } },
        { id: "database/models.py", type: "customNode", position: { x: 900, y: 240 }, data: { label: "models.py", path: "database/models.py", type: "Model", icon: "📄", bg: "#251b10", border: "#f59e0b", textColor: "#f59e0b", risk_score: 72, complexity: 25 } }
      ],
      edges: [
        { id: "fe1", source: "main.py", target: "api/routes/users.py", animated: true },
        { id: "fe2", source: "main.py", target: "api/routes/products.py", animated: true },
        { id: "fe3", source: "main.py", target: "api/routes/orders.py", animated: true },
        { id: "fe4", source: "api/routes/users.py", target: "api/controllers/user_controller.py", animated: true },
        { id: "fe5", source: "api/routes/products.py", target: "api/controllers/product_controller.py", animated: true },
        { id: "fe6", source: "api/routes/orders.py", target: "api/controllers/order_controller.py", animated: true },
        { id: "fe7", source: "api/controllers/order_controller.py", target: "api/services/payment_service.py", animated: true },
        { id: "fe8", source: "api/controllers/product_controller.py", target: "api/services/inventory_service.py", animated: true },
        { id: "fe9", source: "api/controllers/user_controller.py", target: "database/connection.py", animated: true },
        { id: "fe10", source: "api/services/payment_service.py", target: "database/connection.py", animated: true },
        { id: "fe11", source: "api/services/inventory_service.py", target: "database/models.py", animated: true },
        { id: "fe12", source: "database/connection.py", target: "api/routes/users.py", animated: true } // Cycle!
      ],
      mermaid: `graph TD
    main_py["🌐 main.py"] --> api_routes_users_py["🌐 users.py"]
    main_py --> api_routes_products_py["🌐 products.py"]
    main_py --> api_routes_orders_py["🌐 orders.py"]
    api_routes_users_py --> api_controllers_user_controller_py["⚡ user_controller.py"]
    api_routes_products_py --> api_controllers_product_controller_py["⚡ product_controller.py"]
    api_routes_orders_py --> api_controllers_order_controller_py["⚡ order_controller.py"]
    api_controllers_order_controller_py --> api_services_payment_service_py["⚙️ payment_service.py"]
    api_controllers_product_controller_py --> api_services_inventory_service_py["⚙️ inventory_service.py"]
    api_controllers_user_controller_py --> database_connection_py["🗄️ connection.py"]
    api_services_payment_service_py --> database_connection_py
    api_services_inventory_service_py --> database_models_py["📄 models.py"]
    database_connection_py --> api_routes_users_py`
    },
    system_graph: {
      nodes: [
        { id: "API Gateway / Routing", type: "customNode", position: { x: 100, y: 100 }, data: { label: "API Gateway / Routing", path: "system://API Gateway / Routing", type: "API", icon: "🌐", bg: "#0a1a24", border: "#06b6d4", textColor: "#06b6d4", risk_score: 51, complexity: 10 } },
        { id: "User API Layer", type: "customNode", position: { x: 300, y: 50 }, data: { label: "User API Layer", path: "system://User API Layer", type: "Controller", icon: "⚡", bg: "#170e24", border: "#8b5cf6", textColor: "#8b5cf6", risk_score: 55, complexity: 15 } },
        { id: "Product Business Service", type: "customNode", position: { x: 500, y: 150 }, data: { label: "Product Business Service", path: "system://Product Business Service", type: "Service", icon: "⚙️", bg: "#081329", border: "#3b82f6", textColor: "#3b82f6", risk_score: 29, complexity: 8 } },
        { id: "Order Business Service", type: "customNode", position: { x: 500, y: 270 }, data: { label: "Order Business Service", type: "Service", icon: "⚙️", bg: "#081329", border: "#3b82f6", textColor: "#3b82f6", risk_score: 73, complexity: 20 } },
        { id: "Relational Database Layer", type: "customNode", position: { x: 900, y: 150 }, data: { label: "Relational Database Layer", path: "system://Relational Database Layer", type: "Database", icon: "🗄️", bg: "#071c12", border: "#10b981", textColor: "#10b981", risk_score: 66, complexity: 18 } }
      ],
      edges: [
        { id: "se1", source: "API Gateway / Routing", target: "User API Layer", animated: true },
        { id: "se2", source: "API Gateway / Routing", target: "Product Business Service", animated: true },
        { id: "se3", source: "API Gateway / Routing", target: "Order Business Service", animated: true },
        { id: "se4", source: "User API Layer", target: "Relational Database Layer", animated: true },
        { id: "se5", source: "Product Business Service", target: "Relational Database Layer", animated: true },
        { id: "se6", source: "Order Business Service", target: "Relational Database Layer", animated: true },
        { id: "se7", source: "Relational Database Layer", target: "User API Layer", animated: true } // Cycle loop!
      ],
      mermaid: `graph TD
    API_Gateway_Routing["🌐 API Gateway / Routing"] --> User_API_Layer["⚡ User API Layer"]
    API_Gateway_Routing --> Product_Business_Service["⚙️ Product Business Service"]
    API_Gateway_Routing --> Order_Business_Service["⚙️ Order Business Service"]
    User_API_Layer --> Relational_Database_Layer["🗄️ Relational Database Layer"]
    Product_Business_Service --> Relational_Database_Layer
    Order_Business_Service --> Relational_Database_Layer
    Relational_Database_Layer --> User_API_Layer`
    },
    warnings: [
      {
        id: "warn_cycle_0",
        title: "Circular Dependency Cycle Detected",
        description: "Found direct tightly-coupled loops: connection.py → users.py → connection.py. This breaks modular separation principles and blocks clean deployment boundaries.",
        severity: "CRITICAL",
        files: ["database/connection.py", "api/routes/users.py"]
      },
      {
        id: "warn_unused_0",
        title: "Unused Module Warning",
        description: "File 'unused_helper.py' has 0 dependents importing it. Dead code logic or missing registration inside entrypoint bindings.",
        severity: "LOW",
        files: ["api/services/unused_helper.py"]
      },
      {
        id: "warn_large_0",
        title: "Bloated Module Detected",
        description: "File 'models.py' spans 520 lines of code. High risk of accumulating mixed concerns. Consider refactoring into smaller services.",
        severity: "MEDIUM",
        files: ["database/models.py"]
      }
    ],
    insights: {
      risks: [
        { file: "api/services/payment_service.py", metric: "Risk Score: 82/100" },
        { file: "api/controllers/order_controller.py", metric: "Risk Score: 65/100" }
      ],
      critical_files: [
        { file: "database/connection.py", metric: "Degrees: 2 In, 1 Out" },
        { file: "api/routes/users.py", metric: "Degrees: 2 In, 1 Out" }
      ],
      bottlenecks: [
        { file: "api/services/payment_service.py", metric: "Impact Factor: 44" },
        { file: "database/connection.py", metric: "Impact Factor: 22" }
      ],
      refactoring: [
        { file: "database/models.py", metric: "Lines of code: 520" },
        { file: "api/services/unused_helper.py", metric: "Lines of code: 15" }
      ]
    },
    node_details: {
      "main.py": {
        purpose: "Exposes routing paths and API endpoints for logical client operations (main.py).",
        responsibilities: ["Initialize FastAPI application app", "Mount cors middlewares", "Include route endpoints"],
        imports: ["api/routes/users.py", "api/routes/products.py", "api/routes/orders.py"],
        dependents: [],
        risk_score: 15,
        complexity: 5,
        files_involved: ["main.py"],
        is_component: false
      },
      "api/routes/users.py": {
        purpose: "Exposes users REST endpoints for registration and authentication profiles.",
        responsibilities: ["GET /users/profile", "POST /users/login", "POST /users/register"],
        imports: ["api/controllers/user_controller.py"],
        dependents: ["main.py", "database/connection.py"],
        risk_score: 75,
        complexity: 12,
        files_involved: ["api/routes/users.py"],
        is_component: false
      },
      "api/services/payment_service.py": {
        purpose: "Coordinates order payment charging triggers and integration wrappers.",
        responsibilities: ["charge()", "verify_stripe_signature()", "issue_refund()"],
        imports: ["database/connection.py"],
        dependents: ["api/controllers/order_controller.py"],
        risk_score: 82,
        complexity: 22,
        files_involved: ["api/services/payment_service.py"],
        is_component: false
      },
      "database/models.py": {
        purpose: "Declares schemas and tables mapping variables to SQL databases.",
        responsibilities: ["Class: User", "Class: Order", "Class: Product"],
        imports: [],
        dependents: ["api/services/inventory_service.py"],
        risk_score: 72,
        complexity: 25,
        files_involved: ["database/models.py"],
        is_component: false
      },
      "API Gateway / Routing": {
        purpose: "Logical architectural block aggregating 4 project modules. Functions as entrypoint and gateway.",
        responsibilities: ["FastAPI app initialization", "HTTP endpoint mapping", "CORS policy and middleware setups"],
        imports: ["User API Layer", "Product Business Service", "Order Business Service"],
        dependents: [],
        risk_score: 51,
        complexity: 10,
        files_involved: ["main.py", "api/routes/users.py", "api/routes/products.py", "api/routes/orders.py"],
        is_component: true
      },
      "User API Layer": {
        purpose: "Logical block managing authentication requests and profiles.",
        responsibilities: ["Authenticate user sessions", "Validate JWT tokens", "Delegate requests to user tables"],
        imports: ["Relational Database Layer"],
        dependents: ["API Gateway / Routing", "Relational Database Layer"],
        risk_score: 55,
        complexity: 15,
        files_involved: ["api/routes/users.py", "api/controllers/user_controller.py"],
        is_component: true
      },
      "Relational Database Layer": {
        purpose: "Aggregated database datastore module directing SQL connections.",
        responsibilities: ["Manage connection pooling", "Execute select/insert orders", "Sync SQLAlchemy models schema"],
        imports: ["User API Layer"],
        dependents: ["User API Layer", "Product Business Service", "Order Business Service"],
        risk_score: 66,
        complexity: 18,
        files_involved: ["database/connection.py", "database/models.py"],
        is_component: true
      }
    },
    benchmarks: {
      scores: {
        maintainability: 72,
        scalability: 50,
        modularity: 65,
        testability: 35,
        complexity: 75,
        technical_debt: 68,
        security: 85,
        documentation: 45
      },
      strengths: [
        "Clear structural boundaries between system layer definitions.",
        "Centralized entry point configurations validating incoming APIs.",
        "Decoupled models separating relational database configurations."
      ],
      weaknesses: [
        "Database import paths couple with controller routing handlers directly.",
        "Absence of Redis caching structures restricts high frequency throughput.",
        "Cyclic dependencies detected in connection modules."
      ],
      refactoring: [
        "Decouple direct service imports using interface patterns.",
        "Integrate Redis caching middlewares for high frequency endpoints."
      ],
      report: `# Architecture Health Report: ecommerce-fastapi-service

## Executive Summary
The system architecture exhibits modular separation of routes, controllers, services and database layouts. However, decoupling warnings and missing caching layers limit the system stability.

## Architectural Quality Breakdown
- **Modularity (65/100)**: Decoupled service/controller layers but circular import blocks complete isolation.
- **Scalability (50/100)**: Lacks redis caching or message brokers for high-throughput operations.
- **Testability (35/100)**: Needs custom test folders and pytest/jest validation logic.
- **Complexity (75/100)**: Standard cognitive complexity in controllers.

## Recommendations & Roadmap
- Implement Redis cache adapters.
- Set up automated testing framework.
`,
      startup: {
        maintainability: 70, scalability: 60, modularity: 65, testability: 45,
        complexity: 75, technical_debt: 40, security: 65, documentation: 40
      },
      enterprise: {
        maintainability: 85, scalability: 85, modularity: 80, testability: 80,
        complexity: 85, technical_debt: 25, security: 90, documentation: 80
      },
      open_source: {
        maintainability: 80, scalability: 75, modularity: 75, testability: 90,
        complexity: 80, technical_debt: 30, security: 80, documentation: 85
      }
    }
  },
  summary: `{"purpose": "E-commerce transactional micro-monolith API for user booking, inventory tracking, and payment processing.", "architecture": "Modular MVC API Architecture with separated routing routers, business services, and database persistence entities.", "data_flow": "Client HTTP requests land on API Routes, propagate into controller handlers, invoke services (e.g. Stripe Payment Service, Stock Inventory), check models database state, write transactions, and respond.", "dependencies": "FastAPI 0.110.0, Uvicorn, SQLite database, GitPython, Stripe Webhooks.", "risks": "Database connection cyclic dependencies. Payment logic lacks in-memory caching (e.g. Redis). Unused dead files cluttering codebase.", "complexity_score": 73}`
};

const GAUNTLET_LEADERBOARD = [
  { repo: "FastAPI", quality: 92, risk: 88, deadCode: 90, circular: 95, refactor: 89, blastRadius: 91, overall: 91 },
  { repo: "Flask", quality: 88, risk: 85, deadCode: 87, circular: 92, refactor: 86, blastRadius: 89, overall: 88 },
  { repo: "Django", quality: 86, risk: 83, deadCode: 85, circular: 89, refactor: 84, blastRadius: 87, overall: 86 },
  { repo: "React", quality: 85, risk: 80, deadCode: 84, circular: 88, refactor: 82, blastRadius: 85, overall: 84 },
  { repo: "Next.js", quality: 83, risk: 79, deadCode: 82, circular: 86, refactor: 80, blastRadius: 83, overall: 82 },
  { repo: "Supabase", quality: 82, risk: 78, deadCode: 80, circular: 85, refactor: 79, blastRadius: 82, overall: 81 },
  { repo: "LangChain", quality: 78, risk: 74, deadCode: 76, circular: 80, refactor: 75, blastRadius: 78, overall: 77 },
  { repo: "Linux (Subset)", quality: 75, risk: 70, deadCode: 72, circular: 78, refactor: 71, blastRadius: 74, overall: 73 }
];

interface RadarDataset {
  label: string;
  scores: Record<string, number>;
  color: string;
  fillOpacity?: number;
}

function RadarChart({ datasets, className = "" }: { datasets: RadarDataset[]; className?: string }) {
  const metrics = [
    { key: "maintainability", label: "Maint." },
    { key: "scalability", label: "Scal." },
    { key: "modularity", label: "Mod." },
    { key: "testability", label: "Test." },
    { key: "complexity", label: "Compl." },
    { key: "technical_debt", label: "Debt" },
    { key: "security", label: "Sec." },
    { key: "documentation", label: "Docs" }
  ];

  const size = 300;
  const radius = 100;
  const center = size / 2;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / metrics.length) * index - Math.PI / 2;
    const distance = (value / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  const grids = [20, 40, 60, 80, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={`w-full max-w-[280px] mx-auto ${className}`}>
      {grids.map((g) => {
        const points = metrics.map((_, i) => {
          const { x, y } = getCoordinates(i, g);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polygon
            key={g}
            points={points}
            fill="none"
            stroke="#1e293b"
            strokeWidth={1}
          />
        );
      })}

      {metrics.map((_, i) => {
        const outer = getCoordinates(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="#1e293b"
            strokeWidth={1}
          />
        );
      })}

      {metrics.map((m, i) => {
        const { x, y } = getCoordinates(i, 118);
        let textAnchor = "middle";
        if (x < center - 10) textAnchor = "end";
        else if (x > center + 10) textAnchor = "start";
        return (
          <text
            key={m.key}
            x={x}
            y={y + 4}
            fill="#94a3b8"
            fontSize={9}
            fontWeight="bold"
            textAnchor={textAnchor}
            className="font-mono select-none"
          >
            {m.label}
          </text>
        );
      })}

      {datasets.map((dataset, dIdx) => {
        const points = metrics.map((m, i) => {
          const score = dataset.scores[m.key] || 0;
          const { x, y } = getCoordinates(i, score);
          return `${x},${y}`;
        }).join(" ");

        return (
          <g key={dIdx}>
            <polygon
              points={points}
              fill={dataset.color}
              fillOpacity={dataset.fillOpacity ?? 0.15}
              stroke={dataset.color}
              strokeWidth={2}
            />
            {metrics.map((m, i) => {
              const score = dataset.scores[m.key] || 0;
              const { x, y } = getCoordinates(i, score);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={3.5}
                  fill={dataset.color}
                  stroke="#030303"
                  strokeWidth={1}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default function WorkspacePage() {
  const [gitUrl, setGitUrl] = useState("");
  const [activeRepo, setActiveRepo] = useState<any>(MOCK_FASTAPI_REPO);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "docs" | "pr" | "timeline" | "copilot" | "nledit">("chat");

  const [standardsPreset, setStandardsPreset] = useState<"none" | "startup" | "enterprise" | "open_source">("none");
  const [reposList, setReposList] = useState<any[]>([]);
  const [compareRepoId, setCompareRepoId] = useState<string>("");
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Phase 4 states
  const [impactData, setImpactData] = useState<any>(null);
  const [isTracingImpact, setIsTracingImpact] = useState(false);
  const [simulationPrompt, setSimulationPrompt] = useState("");
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [editTabMode, setEditTabMode] = useState<"edit" | "simulate">("edit");
  const [benchMode, setBenchMode] = useState<"radar" | "refactor" | "history" | "review" | "gauntlet">("radar");
  const [refactoringPlan, setRefactoringPlan] = useState<any>(null);
  const [isLoadingRefactor, setIsLoadingRefactor] = useState(false);
  const [historyMetrics, setHistoryMetrics] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // AI Architect Panel state
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hello! I am your ArchAI system design companion. I've analyzed this repository. Ask me any design or flow question! I will refer to relevant code modules and highlight components in the center diagram canvas.",
      referenced_files: [],
      highlighted_nodes: []
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Command palette & Canvas Search
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [canvasSearch, setCanvasSearch] = useState("");

  // Living docs node click state
  const [selectedFileNode, setSelectedFileNode] = useState<string | null>(null);

  // PR Reviewer State
  const [prReviews, setPrReviews] = useState<any[]>([
    {
      id: "demo-pr-1",
      pr_number: 45,
      source_branch: "feature/raw-user-queries",
      target_branch: "main",
      scores: { maintainability: 74, scalability: 68, complexity: 62, risk: 85 },
      impact_report: `### 🚨 Critical Design Alerts

- **Direct Route Database Queries**: \`api/routes/users.py\` contains raw SQL execution linking directly to \`database/connection.py\`. This bypasses the Controller and Model isolation layers.
- **High Architectural Risk**: Direct queries without validation increase vulnerability to **SQL Injection** and tightly couple routing patterns to underlying schemas.`
    }
  ]);
  const [isReviewingPR, setIsReviewingPR] = useState(false);

  // NL Edit State
  const [nlEditPrompt, setNlEditPrompt] = useState("");
  const [isEditingDiagram, setIsEditingDiagram] = useState(false);
  const [editHistory, setEditHistory] = useState<string[]>([]);

  // Copilot State
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [isGeneratingCopilot, setIsGeneratingCopilot] = useState(false);
  const [copilotSpecs, setCopilotSpecs] = useState<any>(null);

  // Timeline versions state
  const [versionsList, setVersionsList] = useState<any[]>([
    { commit_hash: "8f7ab2c1", created_at: "2026-06-15 22:00:00", summary_text: "Initial commit containing basic routing controller hierarchy." },
    { commit_hash: "2e4ffca1", created_at: "2026-06-15 22:15:00", summary_text: "Added Redis database cache integration." }
  ]);
  const [selectedVersionA, setSelectedVersionA] = useState("8f7ab2c1");
  const [selectedVersionB, setSelectedVersionB] = useState("2e4ffca1");

  // Phase 2 states
  const [activeGraph, setActiveGraph] = useState<"system" | "file">("system");
  const [heatmapActive, setHeatmapActive] = useState(false);

  // React Flow instance helpers
  const [flowNodes, setFlowNodes] = useState<any[]>([]);
  const [flowEdges, setFlowEdges] = useState<any[]>([]);

  useEffect(() => {
    if (activeRepo && activeRepo.diagram) {
      const graph = activeGraph === "system" ? activeRepo.diagram.system_graph : activeRepo.diagram.file_graph;
      if (graph) {
        let nodes = graph.nodes || [];
        
        // Apply heatmap risk styling if enabled
        if (heatmapActive) {
          nodes = nodes.map((n: any) => {
            const risk = n.data.risk_score || 0;
            let bg = "#071c12"; // green/low
            let border = "#10b981";
            let text = "#10b981";
            if (risk >= 70) {
              bg = "#240a0a"; // red/high
              border = "#ef4444";
              text = "#ef4444";
            } else if (risk >= 40) {
              bg = "#201808"; // yellow/med
              border = "#f59e0b";
              text = "#f59e0b";
            }
            return {
              ...n,
              style: {
                ...n.style,
                background: bg,
                border: `2px solid ${border}`,
                color: text
              }
            };
          });
        }
        
        // Apply search highlights (opacity)
        if (highlightedNodeIds.length > 0) {
          nodes = nodes.map((node: any) => {
            const isHighlighted = highlightedNodeIds.includes(node.id);
            return {
              ...node,
              style: {
                ...node.style,
                opacity: isHighlighted ? 1.0 : 0.15,
                boxShadow: isHighlighted 
                  ? "0 0 20px rgba(6, 182, 212, 0.8), 0 0 4px rgba(6, 182, 212, 0.4)" 
                  : "none",
                border: isHighlighted
                  ? "2px solid #06b6d4"
                  : node.style?.border || "1px solid #475569"
              }
            };
          });
        }
        
        setFlowNodes(nodes);
        setFlowEdges(graph.edges || []);
      }
    }
  }, [activeRepo, activeGraph, heatmapActive, highlightedNodeIds]);

  // Keyboard shortcut listener for Ctrl+K command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const getBenchmarks = (repo: any) => {
    if (repo?.diagram?.benchmarks) {
      return repo.diagram.benchmarks;
    }
    return {
      scores: {
        maintainability: 65,
        scalability: 50,
        modularity: 70,
        testability: 30,
        complexity: 70,
        technical_debt: 75,
        security: 85,
        documentation: 40
      },
      strengths: [
        "Consistent programming language layouts across modules.",
        "System handles boundary parsing rules deterministically."
      ],
      weaknesses: [
        "High complexity or risk scores on entry handlers.",
        "Unused dead code components detected in filesystem walking."
      ],
      refactoring: [
        "Optimize direct dependencies with helper modules.",
        "Establish automated endpoint test runners."
      ],
      report: "# Architecture Health Report\n\nNo report data available.",
      startup: {
        maintainability: 70, scalability: 60, modularity: 65, testability: 45,
        complexity: 75, technical_debt: 40, security: 65, documentation: 40
      },
      enterprise: {
        maintainability: 85, scalability: 85, modularity: 80, testability: 80,
        complexity: 85, technical_debt: 25, security: 90, documentation: 80
      },
      open_source: {
        maintainability: 80, scalability: 75, modularity: 75, testability: 90,
        complexity: 80, technical_debt: 30, security: 80, documentation: 85
      }
    };
  };

  const fetchReposList = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/repos");
      if (res.ok) {
        const data = await res.json();
        setReposList(data);
      }
    } catch (e) {
      setReposList([
        { id: "ecommerce-fastapi-mock-id", name: "ecommerce-fastapi-service" }
      ]);
    }
  };

  useEffect(() => {
    fetchReposList();
  }, [activeRepo]);

  const handleCompare = async (targetId: string) => {
    if (!targetId) {
      setComparisonResult(null);
      setCompareRepoId("");
      return;
    }
    setCompareRepoId(targetId);
    setIsComparing(true);
    try {
      const res = await fetch(`http://localhost:8000/api/compare/${activeRepo.repo_id}/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setComparisonResult(data);
      } else {
        throw new Error("HTTP error");
      }
    } catch (e) {
      const targetRepo = reposList.find(r => r.id === targetId);
      const targetName = targetRepo ? targetRepo.name : "compared-repository";
      setTimeout(() => {
        setComparisonResult({
          repo_a_name: activeRepo.name,
          repo_b_name: targetName,
          scores_a: getBenchmarks(activeRepo).scores,
          scores_b: {
            maintainability: 78,
            scalability: 70,
            modularity: 80,
            testability: 85,
            complexity: 65,
            technical_debt: 75,
            security: 90,
            documentation: 85
          },
          winner: targetName,
          winner_reason: `${targetName} exhibits stronger testability modules and modular design overlays compared to ${activeRepo.name}.`,
          report: `# Comparative Architecture Report\n\nAnalysis shows ${targetName} has better testing decoupling and higher standard documentation coverage than ${activeRepo.name}.`
        });
      }, 800);
    } finally {
      setIsComparing(false);
    }
  };

  const downloadHealthReport = () => {
    const bms = getBenchmarks(activeRepo);
    const reportText = bms.report || "";
    const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", url);
    dlAnchor.setAttribute("download", `${activeRepo.name}_architecture_health_report.md`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const downloadComparisonReport = () => {
    if (!comparisonResult) return;
    const reportText = comparisonResult.report || "";
    const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", url);
    dlAnchor.setAttribute("download", `${activeRepo.name}_vs_${comparisonResult.repo_b_name}_comparison_report.md`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleTraceImpact = async (nodeId: string) => {
    if (!nodeId) return;
    setIsTracingImpact(true);
    setImpactData(null);
    try {
      const res = await fetch(`http://localhost:8000/api/repos/${activeRepo.repo_id}/impact/${encodeURIComponent(nodeId)}`);
      if (res.ok) {
        const data = await res.json();
        setImpactData(data);
        // Highlight affected nodes
        const affected = [nodeId, ...data.direct, ...data.indirect];
        setHighlightedNodeIds(affected);
      } else {
        throw new Error("HTTP error");
      }
    } catch (e) {
      console.log("Trace impact fallback", e);
      // fallback mock
      setTimeout(() => {
        const direct = activeRepo.diagram.file_graph.edges
          .filter((edge: any) => edge.target === nodeId)
          .map((edge: any) => edge.source);
        const indirect = direct.length > 0 ? ["main.py"] : [];
        setImpactData({
          node_id: nodeId,
          direct: direct,
          indirect: indirect,
          risk_score: 75,
          risk_level: "HIGH",
          explanation: `Modifying ${nodeId.split("/").pop()} will ripple up to the entry points, potentially breaking routes or middleware bindings.`,
          breakages: [
            `Breaking dependency imports inside direct dependents: ${direct.join(", ") || 'None'}.`,
            "Possible runtime import exceptions if signature changes are not handled."
          ],
          mitigation: [
            "Use backward-compatible method parameters.",
            "Write integration unit tests covering dependent modules."
          ]
        });
        setHighlightedNodeIds([nodeId, ...direct, ...indirect]);
      }, 600);
    } finally {
      setIsTracingImpact(false);
    }
  };

  const handleSimulateChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationPrompt) return;
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await fetch(`http://localhost:8000/api/repos/${activeRepo.repo_id}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change_prompt: simulationPrompt })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
      } else {
        throw new Error("HTTP error");
      }
    } catch (e) {
      console.log("Simulate change fallback", e);
      setTimeout(() => {
        setSimulationResult({
          before_mermaid: activeRepo.diagram.system_graph.mermaid,
          after_mermaid: `${activeRepo.diagram.system_graph.mermaid}\n    Relational_Database_Layer --> Cache["🗄️ Redis Cache"]\n    Cache --> Relational_Database_Layer`,
          pros: [
            "Reduces query latency by up to 90% for repeated reads.",
            "Decreases load on primary relational database store.",
            "Increases maximum concurrent traffic capacity."
          ],
          cons: [
            "Introduces cache invalidation complexity and race conditions.",
            "Requires additional infrastructure monitoring and hosting costs.",
            "Increases docker-compose / setup complexity."
          ],
          risk_level: "LOW-MEDIUM",
          complexity_shift: "72 -> 76 (+4 points)",
          cost_impact: "+$15/month (AWS ElastiCache Redis instance)",
          mitigation: "Use standard TTL (Time To Live) configurations and Cache-Aside pattern."
        });
      }, 1000);
    } finally {
      setIsSimulating(false);
    }
  };

  const fetchRefactoringPlan = async () => {
    setIsLoadingRefactor(true);
    try {
      const res = await fetch(`http://localhost:8000/api/repos/${activeRepo.repo_id}/refactor`);
      if (res.ok) {
        const data = await res.json();
        setRefactoringPlan(data);
      } else {
        throw new Error("HTTP error");
      }
    } catch (e) {
      console.log("Refactoring plan fallback", e);
      setTimeout(() => {
        setRefactoringPlan({
          coupling_index: 85,
          priority_list: [
            {
              priority: "CRITICAL",
              title: "Break Circular Loop",
              details: "Resolve the cyclic loop: connection.py -> users.py -> connection.py. Extract database session utilities into a separate file.",
              files: ["database/connection.py", "api/routes/users.py"]
            },
            {
              priority: "HIGH",
              title: "Decompose God Model Class",
              details: "File 'models.py' spans 520 lines of code. Split into database/models/user.py, database/models/order.py, database/models/product.py.",
              files: ["database/models.py"]
            },
            {
              priority: "MEDIUM",
              title: "Remove Dead Code helper",
              details: "File 'unused_helper.py' has no reference or imports. Safe to delete or integrate.",
              files: ["api/services/unused_helper.py"]
            }
          ]
        });
      }, 700);
    } finally {
      setIsLoadingRefactor(false);
    }
  };

  const fetchHistoryMetrics = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`http://localhost:8000/api/repos/${activeRepo.repo_id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistoryMetrics(data);
      } else {
        throw new Error("HTTP error");
      }
    } catch (e) {
      console.log("History metrics fallback", e);
      setHistoryMetrics([
        { commit: "8f7ab2c1", date: "2026-06-15 22:00:00", maintainability: 65, modularity: 70, complexity: 70, warnings: 3 },
        { commit: "2e4ffca1", date: "2026-06-15 22:15:00", maintainability: 72, modularity: 65, complexity: 75, warnings: 3 },
        { commit: "9c3db8a2", date: "2026-06-15 22:30:00", maintainability: 80, modularity: 78, complexity: 68, warnings: 1 }
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeRepo) {
      if (benchMode === "refactor") {
        fetchRefactoringPlan();
      } else if (benchMode === "history") {
        fetchHistoryMetrics();
      }
    }
  }, [benchMode, activeRepo]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitUrl) return;
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ git_url: gitUrl })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRepo(data);
        setVersionsList([
          { commit_hash: data.commit_hash, created_at: new Date().toISOString().replace('T', ' ').substring(0, 19), summary_text: "Analyzed code layout from GitHub clone." }
        ]);
        setChatMessages([
          {
            role: "assistant",
            content: `Cloned and analyzed \`${data.name}\` successfully! I have generated the Canvas nodes showing API route endpoints, controllers, and database links. Ask me anything about this repository's layout.`,
            referenced_files: [],
            highlighted_nodes: []
          }
        ]);
      } else {
        throw new Error("Local backend unavailable or error parsing git repository");
      }
    } catch (err) {
      console.log("Using dynamic mock clone fallback.", err);
      // Fallback: simulate repository clone with mock layout containing name parsed from url
      const mockName = gitUrl.split("/").pop()?.replace(".git", "") || "custom-cloned-app";
      const clonedMock = {
        ...MOCK_FASTAPI_REPO,
        name: mockName,
        git_url: gitUrl,
        commit_hash: "clone-sha-28"
      };
      setTimeout(() => {
        setActiveRepo(clonedMock);
        setChatMessages([
          {
            role: "assistant",
            content: `Analyzed repository \`${mockName}\` (simulated sandbox sandbox). Canvas layout has been rendered.`,
            referenced_files: [],
            highlighted_nodes: []
          }
        ]);
      }, 1500);
    } finally {
      setIsLoading(false);
      setGitUrl("");
    }
  };

  const triggerQuickGraphQuery = async (queryText: string) => {
    const userMsg = { role: "user", content: queryText };
    setChatMessages(prev => [...prev, userMsg]);
    setIsSendingChat(true);
    setHighlightedNodeIds([]);

    try {
      const res = await fetch(`http://localhost:8000/api/repos/${activeRepo.repo_id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: queryText })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: data.answer,
          referenced_files: data.referenced_files,
          highlighted_nodes: data.highlighted_nodes
        }]);
        setHighlightedNodeIds(data.highlighted_nodes);
      } else {
        throw new Error("HTTP error");
      }
    } catch (err) {
      let mockReply = "";
      let refs: string[] = [];
      if (queryText.includes("User Data") || queryText.includes("user data") || queryText.includes("user")) {
        refs = ["api/routes/users.py", "api/controllers/user_controller.py", "database/connection.py", "database/models.py"];
        mockReply = `### Factual Graph Traversal: Touch User Data
Compiler-accurate path traces routing API endpoints down to User DB records:
\`api/routes/users.py (endpoint) -> api/controllers/user_controller.py (contains) -> database/connection.py (reads_from) -> system://database\``;
      } else if (queryText.includes("Redis") || queryText.includes("redis")) {
        refs = ["api/services/payment_service.py", "database/connection.py"];
        mockReply = `### Factual Graph Traversal: What uses Redis?
Complete path mapping from router endpoints to the Redis cache cluster:
\`api/services/payment_service.py -> system://redis_cache\``;
      } else if (queryText.includes("OpenAI") || queryText.includes("openai")) {
        refs = ["api/services/payment_service.py", "main.py"];
        mockReply = `### Factual Graph Traversal: OpenAI Calls
Paths representing logical flows invoking LLMs or Gemini/OpenAI API clients:
\`api/services/payment_service.py (calls) -> system://openai_api\``;
      } else {
        refs = ["api/routes/users.py", "database/connection.py"];
        mockReply = `### Factual Graph Traversal: API to Database paths
Full architecture lifecycle paths tracing routing API endpoints down to persistence database engines:
\`api/routes/users.py -> api/controllers/user_controller.py -> database/connection.py -> system://database\``;
      }

      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: mockReply,
          referenced_files: refs,
          highlighted_nodes: refs
        }]);
        setHighlightedNodeIds(refs);
      }, 800);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    
    const userMsg = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsSendingChat(true);
    setHighlightedNodeIds([]);

    try {
      const res = await fetch(`http://localhost:8000/api/repos/${activeRepo.repo_id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: data.answer,
          referenced_files: data.referenced_files,
          highlighted_nodes: data.highlighted_nodes
        }]);
        setHighlightedNodeIds(data.highlighted_nodes);
      } else {
        throw new Error("HTTP error");
      }
    } catch (err) {
      // Client Mock fallback Chat response based on keywords
      const query = chatInput.toLowerCase();
      let mockReply = "";
      let refs: string[] = [];
      
      if (query.includes("auth") || query.includes("jwt")) {
        refs = ["api/routes/users.py", "api/controllers/user_controller.py"];
        mockReply = `### Authentication Framework Flow

User authorization keys are verified as follows:
1. Client makes an HTTP POST request to \`api/routes/users.py\` (/users/login).
2. The router passes this payload to \`api/controllers/user_controller.py\`.
3. Credentials verify signature models.
4. Token payloads are returned to sign subsequent API headers.`;
      } else if (query.includes("db") || query.includes("database") || query.includes("sql")) {
        refs = ["database/models.py", "database/connection.py"];
        mockReply = `### Database Model Entities

Persistent schemas map database tables via SQL entities:
- \`database/models.py\` declares SQLAlchemy models representing structures.
- Connections initialize connection pools inside \`database/connection.py\`.`;
      } else {
        refs = ["main.py"];
        mockReply = `### Component Dependency Routing

I scanned this repository for **"${chatInput}"**. Core code pathways process inputs:
1. Requests initiate inside \`main.py\` route mounts.
2. Actions delegate tasks down the MVC pipeline.`;
      }

      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: mockReply,
          referenced_files: refs,
          highlighted_nodes: refs
        }]);
        setHighlightedNodeIds(refs);
      }, 800);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleReviewPR = async () => {
    setIsReviewingPR(true);
    try {
      const res = await fetch(`http://localhost:8000/api/repos/${activeRepo.repo_id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_branch: "feature/direct-db-access",
          target_branch: "main",
          pr_number: 48
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPrReviews(prev => [data, ...prev]);
      } else {
        throw new Error("Backend response error");
      }
    } catch (err) {
      setTimeout(() => {
        const newMockReview = {
          id: `demo-pr-${Date.now()}`,
          pr_number: 48,
          source_branch: "feature/direct-db-access",
          target_branch: "main",
          scores: { maintainability: 82, scalability: 78, complexity: 70, risk: 40 },
          impact_report: `### 🔍 Pull Request #48 Code Quality Audit
          
- **Circular Imports**: Clean (no cyclic dependencies found).
- **Clean Architecture Check**: Warn! Inline database queries detected inside controllers. Better to refactor into models file.
- **Maintainability Index**: Solid. Structure is consistent.`
        };
        setPrReviews(prev => [newMockReview, ...prev]);
      }, 1000);
    } finally {
      setIsReviewingPR(false);
    }
  };

  const handleNlEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEditPrompt) return;
    setIsEditingDiagram(true);

    try {
      const res = await fetch(`http://localhost:8000/api/repos/${activeRepo.repo_id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: nlEditPrompt,
          current_mermaid: activeRepo.diagram.mermaid,
          nodes: flowNodes,
          edges: flowEdges
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFlowNodes(data.nodes);
        setFlowEdges(data.edges);
        setEditHistory(prev => [data.summary, ...prev]);
        setActiveRepo(prev => ({
          ...prev,
          diagram: { ...prev.diagram, mermaid: data.mermaid }
        }));
      } else {
        throw new Error("Failed backend editing request");
      }
    } catch (err) {
      // Mock Natural Language Diagram updates on client
      setTimeout(() => {
        const promptLower = nlEditPrompt.toLowerCase();
        let summary = "";
        
        if (promptLower.includes("redis") || promptLower.includes("cache")) {
          // Inject Redis Node
          const cacheId = "database/redis_cache.db";
          const newNodes = [
            ...flowNodes,
            {
              id: cacheId,
              type: "default",
              position: { x: 800, y: 50 },
              data: { label: "🗄️ redis_cache.db", type: "Database" },
              style: { background: "#0d1f14", border: "2px solid #10b981", color: "#10b981", borderRadius: "8px", padding: "10px" }
            }
          ];
          
          // Connect payment service to cache
          const newEdges = [
            ...flowEdges,
            { id: `e_nl_${Date.now()}`, source: "api/services/payment_service.py", target: cacheId, animated: true }
          ];

          setFlowNodes(newNodes);
          setFlowEdges(newEdges);
          summary = "Injected caching node (database/redis_cache.db) linked from billing service endpoints.";
        } else {
          // Add generic service
          const customId = "api/services/notification_service.py";
          const newNodes = [
            ...flowNodes,
            {
              id: customId,
              type: "default",
              position: { x: 720, y: 420 },
              data: { label: "⚙️ notification_service.py", type: "Service" },
              style: { background: "#0e1829", border: "1px solid #3b82f6", color: "#3b82f6", borderRadius: "8px", padding: "10px" }
            }
          ];
          const newEdges = [
            ...flowEdges,
            { id: `e_nl_gen_${Date.now()}`, source: "api/controllers/order_controller.py", target: customId, animated: true }
          ];
          setFlowNodes(newNodes);
          setFlowEdges(newEdges);
          summary = `Added architecture node (${customId}) satisfying prompt command: "${nlEditPrompt}".`;
        }
        
        setEditHistory(prev => [summary, ...prev]);
        setNlEditPrompt("");
      }, 1000);
    } finally {
      setIsEditingDiagram(false);
    }
  };

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotPrompt) return;
    setIsGeneratingCopilot(true);
    setCopilotSpecs(null);

    try {
      const res = await fetch("http://localhost:8000/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: copilotPrompt })
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotSpecs(data);
      } else {
        throw new Error("Copilot API response failed");
      }
    } catch (err) {
      // Mock copilot response
      setTimeout(() => {
        setCopilotSpecs({
          prompt: copilotPrompt,
          design: `# System Specifications: ${copilotPrompt.toUpperCase()}
          
## 1. Top-Level Service Layout
- **API Edge Gateway**: Receives user bookings, verifies authorization models.
- **Match Engine Service**: Resolves location ranges based on coordinate indexes.
- **Transactional Ledger**: Registers stripe events.

## 2. SQL Schema Models
\`\`\`sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    user_id UUID,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'BOOKED'))
);
\`\`\`
`,
          mermaid: `graph TD
    Client --> Gateway[🌐 API Gateway]
    Gateway --> Booking[⚙️ Booking Handler]
    Booking --> Redis[🗄️ Cache]`
        });
      }, 1500);
    } finally {
      setIsGeneratingCopilot(false);
    }
  };

  // Exporter Functions (Feature 6)
  const exportMermaid = () => {
    const graph = activeGraph === "system" ? activeRepo.diagram.system_graph : activeRepo.diagram.file_graph;
    const mermaidText = graph?.mermaid || "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mermaidText);
      alert("Mermaid diagram syntax copied to clipboard!");
    } else {
      alert("Clipboard API not supported. Copy code manually:\n\n" + mermaidText);
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeRepo.diagram, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${activeRepo.name}_archai_spec.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const exportSVG = () => {
    const svgEl = document.querySelector(".react-flow__renderer svg");
    if (!svgEl) {
      alert("No canvas SVG found to export");
      return;
    }
    const svgSerializer = new XMLSerializer();
    const svgStr = svgSerializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", url);
    dlAnchor.setAttribute("download", `${activeRepo.name}_architecture.svg`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    const svgEl = document.querySelector(".react-flow__renderer svg");
    if (!svgEl) {
      alert("No canvas SVG found to export");
      return;
    }
    const svgSerializer = new XMLSerializer();
    const svgStr = svgSerializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#030303";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const pngUrl = canvas.toDataURL("image/png");
          const dlAnchor = document.createElement('a');
          dlAnchor.setAttribute("href", pngUrl);
          dlAnchor.setAttribute("download", `${activeRepo.name}_architecture.png`);
          document.body.appendChild(dlAnchor);
          dlAnchor.click();
          dlAnchor.remove();
        } catch (e) {
          window.open(url); // fallback
        }
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Node search in React Flow (Feature 5)
  const handleSearchCanvas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvasSearch) {
      setHighlightedNodeIds([]);
      return;
    }
    const query = canvasSearch.toLowerCase();
    const graph = activeGraph === "system" ? activeRepo.diagram.system_graph : activeRepo.diagram.file_graph;
    if (!graph || !graph.nodes) return;

    const matched = graph.nodes
      .filter((n: any) => {
        const label = (n.data.label || "").toLowerCase();
        const path = (n.id || "").toLowerCase();
        const type = (n.data.type || "").toLowerCase();
        
        const details = activeRepo.diagram?.node_details?.[n.id] || {};
        const filesMatch = (details.files_involved || []).some((f: string) => f.toLowerCase().includes(query));
        const responsibilitiesMatch = (details.responsibilities || []).some((r: string) => r.toLowerCase().includes(query));
        
        return label.includes(query) || path.includes(query) || type.includes(query) || filesMatch || responsibilitiesMatch;
      })
      .map((n: any) => n.id);
    setHighlightedNodeIds(matched);
  };

  // Click file node inside left sidebar directory tree
  const handleFileClick = (path: string, componentType?: string) => {
    setSelectedFileNode(path);
    setHighlightedNodeIds([path]);
    
    // Toggle docs tab to display file analysis details
    setActiveTab("docs");
  };

  // Render directory tree recursively
  const renderTree = (node: any) => {
    if (node.type === "file") {
      const colorMap: Record<string, string> = {
        'API/Route': 'text-neon-cyan',
        'Controller': 'text-neon-purple',
        'Service': 'text-primary',
        'Model': 'text-amber-500',
        'Database': 'text-emerald-500',
        'Infrastructure': 'text-red-500'
      };
      
      const fileColor = colorMap[node.component_type] || 'text-slate-400';
      const isSelected = selectedFileNode === node.path;

      return (
        <div 
          key={node.path} 
          onClick={() => handleFileClick(node.path, node.component_type)}
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-xs font-mono transition-all hover:bg-white/5 ${isSelected ? "bg-primary/20 text-white font-semibold" : "text-slate-400"}`}
        >
          <File className={`w-3.5 h-3.5 ${fileColor}`} />
          <span className="truncate">{node.name}</span>
        </div>
      );
    }

    return (
      <div key={node.path || node.name} className="flex flex-col gap-1">
        <div className="flex items-center gap-2 py-1 px-2 text-xs font-mono text-slate-300 font-semibold select-none">
          <Folder className="w-3.5 h-3.5 text-amber-600 fill-amber-600/20" />
          <span>{node.name}</span>
        </div>
        <div className="pl-3.5 border-l border-white/5 ml-3 flex flex-col gap-1 mt-0.5">
          {node.children && node.children.map((child: any) => renderTree(child))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden font-sans">
      
      {/* Upper Navigation bar */}
      <nav className="glass-panel border-b border-card-border px-6 py-3.5 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-neon-purple flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">Arch<span className="text-neon-cyan">AI</span></span>
          </Link>
          <span className="text-xs text-slate-500 font-mono hidden md:inline">| Sandbox Workspace</span>
        </div>

        {/* Git Analyzer Paste Form */}
        <form onSubmit={handleAnalyze} className="hidden md:flex items-center gap-2 max-w-lg w-full mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Paste GitHub Repository URL (e.g. https://github.com/fastapi/fastapi)..." 
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#0c0c0c] border border-card-border focus:border-primary focus:outline-none text-xs text-slate-200 transition-all font-mono"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 rounded-full border border-t-transparent border-white animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs">
          <button 
            onClick={() => setIsCmdOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border bg-slate-900/30 text-slate-400 hover:text-white"
          >
            <span>Palette</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">Ctrl+K</kbd>
          </button>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400 font-mono hidden sm:inline">Engine Active</span>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side: Repo Tree View */}
        <aside className="w-64 bg-[#080808] border-r border-card-border flex flex-col flex-shrink-0 z-20 overflow-y-auto p-4 select-none">
          <div className="flex items-center justify-between text-slate-500 uppercase tracking-widest text-[10px] font-extrabold mb-4 pb-2 border-b border-card-border">
            <span>Repository Files</span>
            <GitBranch className="w-3.5 h-3.5" />
          </div>

          <div className="mb-2 p-2 rounded bg-slate-950/80 border border-card-border font-mono text-[10px] text-slate-400">
            <span className="block text-white font-bold truncate">{activeRepo.name}</span>
            <span className="text-slate-500">commit: {activeRepo.commit_hash}</span>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            {activeRepo.file_tree && renderTree(activeRepo.file_tree)}
          </div>
        </aside>

        {/* Center Panel: Interactive Diagram Canvas */}
        <main className="flex-1 bg-[#030303] flex flex-col relative z-10">
          
          {/* Canvas Search & Tools */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 items-center bg-black/60 p-2 rounded-xl border border-card-border backdrop-blur-md">
            <form onSubmit={handleSearchCanvas} className="flex gap-1 items-center">
              <input 
                type="text" 
                placeholder="Search nodes..."
                value={canvasSearch}
                onChange={(e) => setCanvasSearch(e.target.value)}
                className="bg-black border border-card-border rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-neon-cyan max-w-[130px] font-mono" 
              />
              <button type="submit" className="p-1 rounded-lg bg-slate-900 border border-card-border hover:bg-slate-800 text-slate-300">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
            
            {highlightedNodeIds.length > 0 && (
              <button 
                onClick={() => setHighlightedNodeIds([])} 
                className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-950/60 text-red-400 text-[10px] border border-red-500/20"
              >
                Clear
              </button>
            )}

            <div className="h-4 w-px bg-card-border" />

            {/* Graph view toggles (Feature 2) */}
            <div className="flex bg-[#0c0c0c] border border-card-border rounded-lg p-0.5 text-[10px] font-bold">
              <button 
                onClick={() => { setActiveGraph("system"); setHighlightedNodeIds([]); }}
                className={`px-2 py-1 rounded-md transition-all ${activeGraph === "system" ? "bg-primary text-white" : "text-slate-500 hover:text-white"}`}
              >
                System
              </button>
              <button 
                onClick={() => { setActiveGraph("file"); setHighlightedNodeIds([]); }}
                className={`px-2 py-1 rounded-md transition-all ${activeGraph === "file" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-white"}`}
              >
                Files
              </button>
            </div>

            {/* Heatmap toggle (Feature 8) */}
            <button 
              onClick={() => setHeatmapActive(!heatmapActive)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${heatmapActive ? "bg-amber-500/20 border-amber-500 text-amber-500 font-extrabold animate-pulse" : "bg-slate-950/80 border-card-border text-slate-400 hover:text-white"}`}
            >
              Heatmap
            </button>
          </div>

          {/* Exporter Menubar (Feature 6) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-card-border backdrop-blur-md">
            <span className="text-[10px] font-mono text-slate-500 mr-2 hidden lg:inline">Export:</span>
            <button 
              onClick={exportMermaid}
              className="px-2.5 py-1 rounded bg-[#0f172a] border border-neon-cyan/20 text-neon-cyan hover:bg-slate-800 text-[10px] font-mono"
            >
              Mermaid
            </button>
            <button 
              onClick={exportSVG}
              className="px-2.5 py-1 rounded bg-[#0f172a] border border-primary/20 text-primary hover:bg-slate-800 text-[10px] font-mono"
            >
              SVG
            </button>
            <button 
              onClick={exportPNG}
              className="px-2.5 py-1 rounded bg-[#0f172a] border border-neon-purple/20 text-neon-purple hover:bg-slate-800 text-[10px] font-mono"
            >
              PNG
            </button>
            <button 
              onClick={exportJSON}
              className="px-2.5 py-1 rounded bg-[#0f172a] border border-emerald-500/20 text-emerald-500 hover:bg-slate-800 text-[10px] font-mono"
            >
              JSON
            </button>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="flex-1 h-full w-full relative">
            {ReactFlow ? (
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                fitView
                onNodeClick={(_: any, node: any) => handleFileClick(node.id)}
              >
                <Background color="#1f2937" gap={16} size={1} />
                <Controls />
              </ReactFlow>
            ) : (
              <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                <Code className="w-8 h-8 text-primary mb-2 animate-pulse" />
                <span>React Flow engine canvas initializing...</span>
              </div>
            )}
          </div>

          {/* Bottom code representation strip */}
          <div className="h-12 bg-black/90 border-t border-card-border flex items-center justify-between px-4 text-xs font-mono text-slate-400 z-10">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-neon-cyan" />
              <span>Canvas Visual Sync: active</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Nodes: {flowNodes.length}</span>
              <span>Edges: {flowEdges.length}</span>
            </div>
          </div>
        </main>

        {/* Right Side: Multi-Tab AI Architect Workspace */}
        <aside className="w-[450px] bg-[#080808] border-l border-card-border flex flex-col flex-shrink-0 z-20">
          
          {/* Action Tabs Header */}
          <div className="grid grid-cols-6 border-b border-card-border bg-[#0b0b0b] text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            <button 
              onClick={() => setActiveTab("chat")}
              className={`py-3 border-r border-card-border text-center hover:text-white ${activeTab === "chat" ? "bg-background text-neon-cyan border-b-2 border-b-neon-cyan" : ""}`}
            >
              Chat
            </button>
            <button 
              onClick={() => setActiveTab("docs")}
              className={`py-3 border-r border-card-border text-center hover:text-white ${activeTab === "docs" ? "bg-background text-primary border-b-2 border-b-primary" : ""}`}
            >
              Docs
            </button>
            <button 
              onClick={() => setActiveTab("pr")}
              className={`py-3 border-r border-card-border text-center hover:text-white ${activeTab === "pr" ? "bg-background text-neon-purple border-b-2 border-b-neon-purple" : ""}`}
            >
              PR
            </button>
            <button 
              onClick={() => setActiveTab("timeline")}
              className={`py-3 border-r border-card-border text-center hover:text-white ${activeTab === "timeline" ? "bg-background text-white border-b-2 border-b-white" : ""}`}
            >
              Bench
            </button>
            <button 
              onClick={() => setActiveTab("nledit")}
              className={`py-3 border-r border-card-border text-center hover:text-white ${activeTab === "nledit" ? "bg-background text-neon-green border-b-2 border-b-neon-green" : ""}`}
            >
              Edit
            </button>
            <button 
              onClick={() => setActiveTab("copilot")}
              className={`py-3 text-center hover:text-white ${activeTab === "copilot" ? "bg-background text-amber-500 border-b-2 border-b-amber-500" : ""}`}
            >
              Copilot
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col justify-between">
            
            {/* 1. CHAT WORKSPACE */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between h-full min-h-0">
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 items-start text-xs ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-md bg-neon-cyan flex items-center justify-center text-black font-extrabold text-[10px] flex-shrink-0">
                          AI
                        </div>
                      )}
                      <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${msg.role === 'user' ? 'bg-primary/10 border border-primary/20 text-slate-200' : 'bg-slate-900/60 border border-card-border text-slate-300'}`}>
                        {/* Render simple markdown styling replacement */}
                        <div className="whitespace-pre-line space-y-1.5">
                          {msg.content}
                        </div>

                        {/* File References clickable tags */}
                        {msg.referenced_files && msg.referenced_files.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-card-border flex flex-wrap gap-1.5 items-center">
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Files:</span>
                            {msg.referenced_files.map((file: string) => (
                              <button 
                                key={file}
                                onClick={() => handleFileClick(file)}
                                className="px-2 py-0.5 rounded bg-slate-950 text-neon-cyan hover:bg-slate-800 text-[10px] font-mono border border-neon-cyan/20"
                              >
                                {file.split("/").pop()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="flex gap-2.5 items-start text-xs">
                      <div className="w-6 h-6 rounded-md bg-neon-cyan flex items-center justify-center text-black font-extrabold text-[10px] animate-pulse">
                        AI
                      </div>
                      <div className="bg-slate-900/40 border border-card-border p-3 rounded-xl text-slate-500 font-mono text-[10px] flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border border-t-transparent border-neon-cyan animate-spin" />
                        AI Architect is thinking...
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
                <div className="mb-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Quick Graph Queries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => triggerQuickGraphQuery("Show API to Database paths")}
                      className="px-2.5 py-1 rounded bg-[#0c0c0c] border border-card-border text-neon-cyan hover:bg-slate-900 hover:text-white text-[10px] font-mono transition-all"
                    >
                      Show API to Database
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerQuickGraphQuery("Which services touch user data?")}
                      className="px-2.5 py-1 rounded bg-[#0c0c0c] border border-card-border text-neon-cyan hover:bg-slate-900 hover:text-white text-[10px] font-mono transition-all"
                    >
                      Touch User Data?
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerQuickGraphQuery("Which APIs depend on Redis?")}
                      className="px-2.5 py-1 rounded bg-[#0c0c0c] border border-card-border text-neon-cyan hover:bg-slate-900 hover:text-white text-[10px] font-mono transition-all"
                    >
                      What uses Redis?
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerQuickGraphQuery("Which modules call OpenAI?")}
                      className="px-2.5 py-1 rounded bg-[#0c0c0c] border border-card-border text-neon-cyan hover:bg-slate-900 hover:text-white text-[10px] font-mono transition-all"
                    >
                      OpenAI Calls?
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendChat} className="border-t border-card-border pt-4 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask a question about database, endpoints, or flows..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-black border border-card-border text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-neon-cyan font-mono"
                  />
                  <button type="submit" className="p-2 rounded-lg bg-neon-cyan hover:opacity-95 text-black font-semibold">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* 2. LIVING WALKTHROUGH DOCS */}
            {activeTab === "docs" && (
              <div className="flex-1 text-xs space-y-4 overflow-y-auto pr-1">
                {selectedFileNode ? (
                  (() => {
                    const details = activeRepo.diagram?.node_details?.[selectedFileNode];
                    if (!details) {
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-card-border pb-2">
                            <span className="font-bold font-mono text-neon-cyan truncate">{selectedFileNode}</span>
                            <button onClick={() => setSelectedFileNode(null)} className="text-[10px] text-slate-500 hover:text-white">Reset</button>
                          </div>
                          <p className="text-slate-500 font-mono text-[10px]">No design specification details computed for this module yet.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-4 font-sans text-xs">
                        <div className="flex items-center justify-between border-b border-card-border pb-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold font-mono text-neon-cyan truncate">{selectedFileNode.split("/").pop()}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                              {details.is_component ? "Component" : "File"}
                            </span>
                          </div>
                          <button 
                            onClick={() => setSelectedFileNode(null)}
                            className="text-[10px] text-slate-500 hover:text-white font-mono flex-shrink-0"
                          >
                            Reset
                          </button>
                        </div>

                        {/* Purpose (Feature 4) */}
                        <div className="bg-slate-950/80 border border-card-border p-3 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Purpose</span>
                          <p className="text-slate-300 leading-relaxed font-sans">{details.purpose}</p>
                        </div>

                        {/* Responsibilities (Feature 4) */}
                        <div className="bg-slate-950/80 border border-card-border p-3 rounded-xl space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Responsibilities</span>
                          <ul className="list-disc pl-4 space-y-1 text-slate-300 font-mono text-[10.5px]">
                            {details.responsibilities.map((r: string, idx: number) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Grid of Risk & Complexity (Feature 4) */}
                        <div className="grid grid-cols-2 gap-2 text-center font-mono">
                          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-card-border">
                            <span className="block text-[9px] text-slate-500">Risk Score</span>
                            <strong className={`text-base ${details.risk_score >= 70 ? 'text-red-400' : details.risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {details.risk_score}/100
                            </strong>
                          </div>
                          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-card-border">
                            <span className="block text-[9px] text-slate-500">Complexity</span>
                            <strong className="text-base text-primary">{details.complexity}</strong>
                          </div>
                        </div>

                        {/* Trace Blast Radius Trigger Button */}
                        <button
                          onClick={() => handleTraceImpact(selectedFileNode)}
                          disabled={isTracingImpact}
                          className="w-full py-2 px-3 rounded-lg bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/20 font-bold transition-all text-center flex items-center justify-center gap-1.5"
                        >
                          {isTracingImpact ? (
                            <>
                              <div className="w-3.5 h-3.5 rounded-full border border-t-transparent border-red-400 animate-spin" />
                              Tracing Blast Radius...
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4" />
                              Trace Blast Radius
                            </>
                          )}
                        </button>

                        {/* Blast Radius Display */}
                        {impactData && impactData.node_id === selectedFileNode && (
                          <div className="bg-red-950/10 border border-red-500/20 rounded-xl p-3 space-y-3 animate-fade-in font-sans">
                            <div className="flex items-center justify-between border-b border-red-500/10 pb-1.5">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Blast Radius: {impactData.risk_level} Risk ({impactData.risk_score}/100)</span>
                              <button 
                                onClick={() => { setImpactData(null); setHighlightedNodeIds([]); }}
                                className="text-[9px] text-slate-500 hover:text-white font-mono"
                              >
                                Clear
                              </button>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{impactData.explanation}</p>
                            
                            {impactData.direct && impactData.direct.length > 0 && (
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Directly Impacted ({impactData.direct.length})</span>
                                <div className="flex flex-wrap gap-1">
                                  {impactData.direct.map((d: string) => (
                                    <span key={d} className="px-1.5 py-0.5 rounded bg-slate-900 border border-red-500/10 font-mono text-[9px] text-red-300 truncate max-w-[150px]">
                                      {d.split("/").pop()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {impactData.indirect && impactData.indirect.length > 0 && (
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Indirectly Impacted ({impactData.indirect.length})</span>
                                <div className="flex flex-wrap gap-1">
                                  {impactData.indirect.map((d: string) => (
                                    <span key={d} className="px-1.5 py-0.5 rounded bg-slate-900 border border-red-500/10 font-mono text-[9px] text-purple-300 truncate max-w-[150px]">
                                      {d.split("/").pop()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {impactData.breakages && impactData.breakages.length > 0 && (
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Potential Breakages</span>
                                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[10.5px]">
                                  {impactData.breakages.map((b: string, i: number) => (
                                    <li key={i}>{b}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {impactData.mitigation && impactData.mitigation.length > 0 && (
                              <div className="pt-2 border-t border-red-500/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Suggested Mitigation</span>
                                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[10.5px]">
                                  {impactData.mitigation.map((m: string, i: number) => (
                                    <li key={i}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Files Involved */}
                        {details.files_involved && details.files_involved.length > 0 && !details.files_involved.includes(selectedFileNode) && (
                          <div className="bg-[#080808] border border-card-border p-3 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Source Files</span>
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                              {details.files_involved.map((file: string) => (
                                <div 
                                  key={file} 
                                  onClick={() => {
                                    setSelectedFileNode(file);
                                    setHighlightedNodeIds([file]);
                                  }}
                                  className="text-[10px] text-slate-400 font-mono hover:text-white cursor-pointer truncate"
                                >
                                  📄 {file}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Imports & Dependents */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-950/80 p-3 rounded-xl border border-card-border space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Imports ({details.imports.length})</span>
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                              {details.imports.map((imp: string) => (
                                <button
                                  key={imp}
                                  onClick={() => handleFileClick(imp)}
                                  className="text-[10px] text-neon-cyan font-mono hover:underline text-left truncate block"
                                >
                                  {imp.split("/").pop()}
                                </button>
                              ))}
                              {details.imports.length === 0 && <span className="text-[10px] text-slate-600 font-mono">None</span>}
                            </div>
                          </div>
                          <div className="bg-slate-950/80 p-3 rounded-xl border border-card-border space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Used By ({details.dependents.length})</span>
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                              {details.dependents.map((dep: string) => (
                                <button
                                  key={dep}
                                  onClick={() => handleFileClick(dep)}
                                  className="text-[10px] text-neon-purple font-mono hover:underline text-left truncate block"
                                >
                                  {dep.split("/").pop()}
                                </button>
                              ))}
                              {details.dependents.length === 0 && <span className="text-[10px] text-slate-600 font-mono">None</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="space-y-4 font-sans text-xs">
                    {(() => {
                      let parsedSummary: any = null;
                      try {
                        parsedSummary = JSON.parse(activeRepo.summary);
                      } catch (e) {
                        parsedSummary = null;
                      }

                      if (!parsedSummary) {
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-card-border pb-2">
                              <span className="font-extrabold uppercase text-[10px] text-slate-400">Architecture Spec</span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 text-[9px]">v1.0</span>
                            </div>
                            <div className="whitespace-pre-line text-slate-300 leading-relaxed font-sans prose prose-invert">
                              {activeRepo.summary}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-card-border pb-2">
                            <span className="font-extrabold uppercase text-[10px] text-slate-400">System Spec Summary</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 text-[9px] font-mono">Complexity:</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${parsedSummary.complexity_score >= 70 ? 'bg-red-950 text-red-400' : parsedSummary.complexity_score >= 40 ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'}`}>
                                {parsedSummary.complexity_score}/100
                              </span>
                            </div>
                          </div>

                          {/* 1. Purpose */}
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase text-neon-cyan tracking-wider">System Purpose</h4>
                            <p className="text-slate-300 leading-relaxed text-[11px] font-sans">{parsedSummary.purpose}</p>
                          </div>

                          {/* 2. Architecture */}
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase text-neon-purple tracking-wider">Core Architecture</h4>
                            <p className="text-slate-300 leading-relaxed text-[11px] font-sans">{parsedSummary.architecture}</p>
                          </div>

                          {/* 3. Data Flow */}
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase text-primary tracking-wider">Data Flow</h4>
                            <p className="text-slate-300 leading-relaxed text-[11px] font-sans">{parsedSummary.data_flow}</p>
                          </div>

                          {/* 4. Dependencies */}
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Infrastructure & External APIs</h4>
                            <p className="text-slate-300 leading-relaxed text-[11px] font-sans">{parsedSummary.dependencies}</p>
                          </div>

                          {/* 5. Risks */}
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Potential Bottlenecks & Risks</h4>
                            <p className="text-slate-300 leading-relaxed text-[11px] font-sans">{parsedSummary.risks}</p>
                          </div>

                          {/* 6. Architecture Warning Log (Feature 7) */}
                          {activeRepo.diagram?.warnings && activeRepo.diagram.warnings.length > 0 && (
                            <div className="pt-3 border-t border-card-border space-y-2">
                              <h4 className="text-[10px] font-bold uppercase text-red-400 flex items-center gap-1.5 tracking-wider">
                                <AlertTriangle className="w-3.5 h-3.5" /> Architecture Warnings ({activeRepo.diagram.warnings.length})
                              </h4>
                              <div className="space-y-2">
                                {activeRepo.diagram.warnings.map((w: any) => (
                                  <div 
                                    key={w.id} 
                                    onClick={() => {
                                      if (w.files && w.files.length > 0) {
                                        setHighlightedNodeIds(w.files);
                                      }
                                    }}
                                    className={`p-2.5 rounded-lg border font-mono text-[10px] cursor-pointer transition-all hover:opacity-90 ${w.severity === 'CRITICAL' ? 'bg-red-950/20 border-red-500/20 text-red-300' : w.severity === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500/20 text-amber-300' : 'bg-slate-900/60 border-card-border text-slate-300'}`}
                                  >
                                    <strong className="block text-[10px] mb-1 font-bold uppercase">{w.title}</strong>
                                    <p className="font-sans leading-relaxed">{w.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 7. Top 5 Architectural Insights Lists (Feature 9) */}
                          {activeRepo.diagram?.insights && (
                            <div className="pt-3 border-t border-card-border space-y-3 font-mono text-[10px]">
                              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Architectural Insights</h4>
                              
                              {/* Top 5 Risks */}
                              <div className="space-y-1 bg-slate-950/50 p-2.5 border border-card-border rounded-lg">
                                <span className="text-[9px] uppercase font-bold text-red-400 block mb-1">Top Risks</span>
                                <div className="space-y-1">
                                  {activeRepo.diagram.insights.risks?.map((r: any, i: number) => (
                                    <div key={i} className="flex justify-between hover:underline cursor-pointer" onClick={() => handleFileClick(r.file)}>
                                      <span className="truncate text-slate-400">{r.file.split("/").pop()}</span>
                                      <span className="text-red-400 font-bold">{r.metric}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Top 5 Critical Files */}
                              <div className="space-y-1 bg-slate-950/50 p-2.5 border border-card-border rounded-lg">
                                <span className="text-[9px] uppercase font-bold text-neon-cyan block mb-1">Top Critical Files</span>
                                <div className="space-y-1">
                                  {activeRepo.diagram.insights.critical_files?.map((c: any, i: number) => (
                                    <div key={i} className="flex justify-between hover:underline cursor-pointer" onClick={() => handleFileClick(c.file)}>
                                      <span className="truncate text-slate-400">{c.file.split("/").pop()}</span>
                                      <span className="text-neon-cyan font-bold">{c.metric}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Top 5 Architectural Bottlenecks */}
                              <div className="space-y-1 bg-slate-950/50 p-2.5 border border-card-border rounded-lg">
                                <span className="text-[9px] uppercase font-bold text-neon-purple block mb-1">Top Bottlenecks</span>
                                <div className="space-y-1">
                                  {activeRepo.diagram.insights.bottlenecks?.map((b: any, i: number) => (
                                    <div key={i} className="flex justify-between hover:underline cursor-pointer" onClick={() => handleFileClick(b.file)}>
                                      <span className="truncate text-slate-400">{b.file.split("/").pop()}</span>
                                      <span className="text-neon-purple font-bold">{b.metric}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Top 5 Refactoring Opportunities */}
                              <div className="space-y-1 bg-slate-950/50 p-2.5 border border-card-border rounded-lg">
                                <span className="text-[9px] uppercase font-bold text-amber-500 block mb-1">Top Refactoring Ops</span>
                                <div className="space-y-1">
                                  {activeRepo.diagram.insights.refactoring?.map((rf: any, i: number) => (
                                    <div key={i} className="flex justify-between hover:underline cursor-pointer" onClick={() => handleFileClick(rf.file)}>
                                      <span className="truncate text-slate-400">{rf.file.split("/").pop()}</span>
                                      <span className="text-amber-500 font-bold">{rf.metric}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* 3. PR REVIEW AUDITOR */}
            {activeTab === "pr" && (
              <div className="flex-1 flex flex-col justify-between text-xs space-y-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-card-border pb-2">
                    <span className="font-extrabold uppercase text-[10px] text-slate-400">PR Security Audit</span>
                    <button 
                      onClick={handleReviewPR}
                      disabled={isReviewingPR}
                      className="px-3 py-1 rounded bg-neon-purple hover:bg-opacity-90 text-white font-semibold flex items-center gap-1.5"
                    >
                      {isReviewingPR ? "Analyzing PR..." : "Simulate PR Review"}
                    </button>
                  </div>

                  {prReviews.map((pr) => (
                    <div key={pr.id} className="glass-panel p-4 rounded-xl border border-neon-purple/20 space-y-3">
                      <div className="flex items-center justify-between text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <GitPullRequest className="w-4 h-4 text-neon-purple" />
                          <span className="font-bold">PR #{pr.pr_number}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{pr.source_branch} → {pr.target_branch}</span>
                      </div>

                      {/* Score dials */}
                      <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                        <div className="bg-slate-950 p-2 rounded border border-card-border">
                          <span className="block text-[8px] text-slate-500">Maint.</span>
                          <strong className={`text-xs ${pr.scores.maintainability >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{pr.scores.maintainability}</strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-card-border">
                          <span className="block text-[8px] text-slate-500">Scal.</span>
                          <strong className="text-xs text-amber-400">{pr.scores.scalability}</strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-card-border">
                          <span className="block text-[8px] text-slate-500">Compl.</span>
                          <strong className="text-xs text-emerald-400">{pr.scores.complexity}</strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-card-border">
                          <span className="block text-[8px] text-slate-500">Risk</span>
                          <strong className={`text-xs ${pr.scores.risk > 70 ? 'text-red-400' : 'text-slate-400'}`}>{pr.scores.risk > 70 ? 'HIGH' : 'LOW'}</strong>
                        </div>
                      </div>

                      <div className="whitespace-pre-line text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-card-border leading-relaxed font-sans text-[11px]">
                        {pr.impact_report}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ARCHITECTURE BENCHMARKS AND COMPARISONS */}
            {activeTab === "timeline" && (
              <div className="flex-1 text-xs space-y-4 overflow-y-auto pr-1 flex-shrink-0 min-h-0 flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
                  <div className="flex items-center justify-between border-b border-card-border pb-2 flex-shrink-0">
                    <span className="font-extrabold uppercase text-[10px] text-slate-400">Architecture Evaluation</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 text-[9px] font-mono">Bench</span>
                  </div>

                  {/* Sub-menu navigation */}
                  <div className="flex bg-[#0c0c0c] border border-card-border rounded-lg p-0.5 text-[9px] font-bold">
                    <button 
                      onClick={() => setBenchMode("radar")}
                      className={`flex-1 py-1 px-0.5 rounded transition-all ${benchMode === "radar" ? "bg-primary text-white" : "text-slate-500 hover:text-white"}`}
                    >
                      Radar Map
                    </button>
                    <button 
                      onClick={() => setBenchMode("refactor")}
                      className={`flex-1 py-1 px-0.5 rounded transition-all ${benchMode === "refactor" ? "bg-primary text-white" : "text-slate-500 hover:text-white"}`}
                    >
                      Roadmap
                    </button>
                    <button 
                      onClick={() => setBenchMode("history")}
                      className={`flex-1 py-1 px-0.5 rounded transition-all ${benchMode === "history" ? "bg-primary text-white" : "text-slate-500 hover:text-white"}`}
                    >
                      History
                    </button>
                    <button 
                      onClick={() => setBenchMode("review")}
                      className={`flex-1 py-1 px-0.5 rounded transition-all ${benchMode === "review" ? "bg-primary text-white" : "text-slate-500 hover:text-white"}`}
                    >
                      Staff Review
                    </button>
                    <button 
                      onClick={() => setBenchMode("gauntlet")}
                      className={`flex-1 py-1 px-0.5 rounded transition-all ${benchMode === "gauntlet" ? "bg-primary text-white" : "text-slate-500 hover:text-white"}`}
                    >
                      Gauntlet
                    </button>
                  </div>

                  {/* SUB-TAB 1: RADAR MAP */}
                  {benchMode === "radar" && (
                    <div className="space-y-4">
                      {/* Radar Chart Visualizer */}
                      <div className="bg-slate-950/60 border border-card-border rounded-xl p-4 flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 font-mono">Radar Metric Analysis</span>
                        
                        <RadarChart 
                          datasets={(() => {
                            const repoBms = getBenchmarks(activeRepo);
                            const list = [
                              { label: activeRepo.name, scores: repoBms.scores, color: "#06b6d4", fillOpacity: 0.15 }
                            ];
                            
                            if (standardsPreset === "startup") {
                              list.push({ label: "Startup Standards", scores: repoBms.startup, color: "#f59e0b", fillOpacity: 0.05 });
                            } else if (standardsPreset === "enterprise") {
                              list.push({ label: "Enterprise Standards", scores: repoBms.enterprise, color: "#a855f7", fillOpacity: 0.05 });
                            } else if (standardsPreset === "open_source") {
                              list.push({ label: "Open Source Standards", scores: repoBms.open_source, color: "#10b981", fillOpacity: 0.05 });
                            }
                            
                            if (comparisonResult) {
                              list.push({ label: comparisonResult.repo_b_name, scores: comparisonResult.scores_b, color: "#ec4899", fillOpacity: 0.1 });
                            }
                            
                            return list;
                          })()}
                        />

                        {/* Standards overlay select */}
                        <div className="w-full mt-4 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">Compare Against:</span>
                          <select
                            value={standardsPreset}
                            onChange={(e) => {
                              setStandardsPreset(e.target.value as any);
                            }}
                            className="bg-black border border-card-border px-2 py-1 rounded text-[10px] text-slate-300 font-mono focus:outline-none"
                          >
                            <option value="none">Repo Only</option>
                            <option value="startup">Startup Standards</option>
                            <option value="enterprise">Enterprise Standards</option>
                            <option value="open_source">Open Source Standards</option>
                          </select>
                        </div>
                      </div>

                      {/* Executive Report Download Button */}
                      <div className="flex gap-2">
                        <button
                          onClick={downloadHealthReport}
                          className="flex-1 py-2 px-3 rounded-lg bg-primary hover:bg-opacity-95 text-white font-semibold text-[11px] text-center flex items-center justify-center gap-1.5"
                        >
                          Download Health Report (.md)
                        </button>
                        {comparisonResult && (
                          <button
                            onClick={downloadComparisonReport}
                            className="flex-1 py-2 px-3 rounded-lg bg-[#ec4899] hover:bg-opacity-95 text-white font-semibold text-[11px] text-center flex items-center justify-center gap-1.5"
                          >
                            Download Diff (.md)
                          </button>
                        )}
                      </div>

                      {/* Compare Repository Selector Dropdown */}
                      <div className="bg-slate-950/60 border border-card-border rounded-xl p-3 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Repo A vs Repo B Comparator</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={compareRepoId}
                            onChange={(e) => handleCompare(e.target.value)}
                            className="flex-1 bg-black border border-card-border p-2 rounded text-[11px] text-slate-300 focus:outline-none focus:border-primary font-mono"
                          >
                            <option value="">-- Select repository to compare --</option>
                            {reposList
                              .filter(r => r.id !== activeRepo.repo_id)
                              .map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))
                            }
                          </select>
                          {compareRepoId && (
                            <button
                              onClick={() => handleCompare("")}
                              className="px-2 py-2 bg-slate-900 border border-card-border hover:bg-slate-800 text-slate-400 hover:text-white rounded text-[11px]"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {isComparing && (
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 py-1">
                            <div className="w-3 h-3 rounded-full border border-t-transparent border-primary animate-spin" />
                            Running comparative architectural review...
                          </div>
                        )}

                        {comparisonResult && (
                          <div className="pt-2 border-t border-card-border space-y-3">
                            <div className="p-3 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/20 rounded-lg">
                              <span className="text-[8px] uppercase font-mono font-extrabold text-neon-purple block mb-1">Architecture Winner</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white bg-neon-purple/20 px-2 py-0.5 rounded border border-neon-purple/30">
                                  {comparisonResult.winner}
                                </span>
                                <span className="text-[10px] text-slate-400 font-sans leading-relaxed">
                                  {comparisonResult.winner_reason}
                                </span>
                              </div>
                            </div>
                            <div className="p-3 bg-[#030303] rounded-lg border border-card-border whitespace-pre-line text-slate-300 font-sans leading-relaxed text-[11px] max-h-[200px] overflow-y-auto font-mono">
                              {comparisonResult.report}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Render Strengths / Weaknesses / Refactoring Lists when not showing comparison */}
                      {!comparisonResult && (
                        <div className="space-y-3">
                          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
                            <span className="text-[9px] uppercase font-bold text-emerald-400 block font-mono">Top Strengths</span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300 font-sans leading-relaxed">
                              {getBenchmarks(activeRepo).strengths.map((str: string, i: number) => (
                                <li key={i}>{str}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2">
                            <span className="text-[9px] uppercase font-bold text-red-400 block font-mono">Top Weaknesses</span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300 font-sans leading-relaxed">
                              {getBenchmarks(activeRepo).weaknesses.map((weak: string, i: number) => (
                                <li key={i}>{weak}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-2">
                            <span className="text-[9px] uppercase font-bold text-amber-500 block font-mono">Refactoring Opportunities</span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300 font-sans leading-relaxed">
                              {getBenchmarks(activeRepo).refactoring.map((ref: string, i: number) => (
                                <li key={i}>{ref}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 2: REFAC ROADMAP */}
                  {benchMode === "refactor" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Priority Refactoring Plan</span>
                        {refactoringPlan && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-card-border text-slate-300">
                            Coupling Index: {refactoringPlan.coupling_index || 70}%
                          </span>
                        )}
                      </div>

                      {isLoadingRefactor ? (
                        <div className="p-8 text-center text-slate-500 font-mono text-[10px] flex flex-col items-center gap-2">
                          <div className="w-5 h-5 rounded-full border border-t-transparent border-primary animate-spin" />
                          Running code structure diagnostics...
                        </div>
                      ) : refactoringPlan && refactoringPlan.priority_list ? (
                        <div className="space-y-3">
                          {refactoringPlan.priority_list.map((plan: any, i: number) => {
                            const priorityColors: Record<string, string> = {
                              CRITICAL: "bg-red-950/30 border-red-500/30 text-red-400",
                              HIGH: "bg-amber-950/30 border-amber-500/30 text-amber-400",
                              MEDIUM: "bg-blue-950/30 border-blue-500/30 text-blue-400",
                              LOW: "bg-slate-900/60 border-card-border text-slate-400"
                            };
                            return (
                              <div key={i} className={`p-3 rounded-xl border ${priorityColors[plan.priority] || priorityColors.LOW} space-y-2`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">{plan.priority} Priority</span>
                                  {plan.files && plan.files.length > 0 && (
                                    <button 
                                      onClick={() => setHighlightedNodeIds(plan.files)}
                                      className="text-[9px] underline hover:text-white font-mono"
                                    >
                                      Highlight files
                                    </button>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-200">{plan.title}</h4>
                                <p className="text-slate-300 font-sans text-[11px] leading-relaxed">{plan.details}</p>
                                
                                {plan.files && plan.files.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-white/5">
                                    {plan.files.map((f: string) => (
                                      <span key={f} className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-[9px] text-slate-400 truncate max-w-[150px]">
                                        {f.split("/").pop()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-600 font-mono text-[10px]">
                          No refactoring plan loaded.
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: HISTORY CHARTS */}
                  {benchMode === "history" && (
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Architecture Memory Timeline</span>
                      
                      {isLoadingHistory ? (
                        <div className="p-8 text-center text-slate-500 font-mono text-[10px] flex flex-col items-center gap-2">
                          <div className="w-5 h-5 rounded-full border border-t-transparent border-primary animate-spin" />
                          Retrieving diagram version history...
                        </div>
                      ) : historyMetrics && historyMetrics.length > 0 ? (
                        <div className="space-y-4">
                          
                          {/* SVG Line Chart Plot */}
                          <div className="bg-slate-950 p-4 border border-card-border rounded-xl">
                            <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block mb-3 text-center">Quality metrics over versions</span>
                            
                            {/* SVG Chart */}
                            {(() => {
                              const chartW = 340;
                              const chartH = 140;
                              const padX = 30;
                              const padY = 20;
                              const graphW = chartW - padX * 2;
                              const graphH = chartH - padY * 2;

                              // History mapping coordinates
                              const pointsCount = historyMetrics.length;
                              const getX = (idx: number) => {
                                if (pointsCount <= 1) return padX + graphW / 2;
                                return padX + (idx / (pointsCount - 1)) * graphW;
                              };

                              // Maps values 0-100 to y coordinates
                              const getY = (val: number) => {
                                return padY + graphH - (val / 100) * graphH;
                              };

                              // Metrics definitions for charts
                              const chartLines = [
                                { key: "maintainability", color: "#06b6d4" },
                                { key: "modularity", color: "#8b5cf6" },
                                { key: "complexity", color: "#3b82f6" }
                              ];

                              return (
                                <div className="w-full">
                                  <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
                                    {/* Gridlines */}
                                    {[25, 50, 75, 100].map((v) => (
                                      <g key={v}>
                                        <line 
                                          x1={padX} 
                                          y1={getY(v)} 
                                          x2={chartW - padX} 
                                          y2={getY(v)} 
                                          stroke="#1e293b" 
                                          strokeDasharray="3 3"
                                        />
                                        <text x={padX - 8} y={getY(v) + 3} fill="#475569" fontSize={8} textAnchor="end" className="font-mono">{v}</text>
                                      </g>
                                    ))}

                                    {/* Chart lines */}
                                    {chartLines.map((line) => {
                                      const pathD = historyMetrics.map((pt, i) => {
                                        const x = getX(i);
                                        const y = getY(pt[line.key]);
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                      }).join(" ");

                                      return (
                                        <g key={line.key}>
                                          <path 
                                            d={pathD} 
                                            fill="none" 
                                            stroke={line.color} 
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                          />
                                          {historyMetrics.map((pt, i) => (
                                            <circle 
                                              key={i} 
                                              cx={getX(i)} 
                                              cy={getY(pt[line.key])} 
                                              r={3} 
                                              fill={line.color} 
                                              stroke="#030303" 
                                              strokeWidth={1}
                                            />
                                          ))}
                                        </g>
                                      );
                                    })}

                                    {/* Commit labels at bottom */}
                                    {historyMetrics.map((pt, i) => (
                                      <text 
                                        key={i} 
                                        x={getX(i)} 
                                        y={chartH - 4} 
                                        fill="#64748b" 
                                        fontSize={7} 
                                        textAnchor="middle" 
                                        className="font-mono"
                                      >
                                        {pt.commit}
                                      </text>
                                    ))}
                                  </svg>
                                  
                                  {/* Legend */}
                                  <div className="flex justify-center gap-4 mt-2 text-[9px] font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-1.5 bg-[#06b6d4] inline-block rounded-sm" />
                                      <span className="text-slate-400">Maintainability</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-1.5 bg-[#8b5cf6] inline-block rounded-sm" />
                                      <span className="text-slate-400">Modularity</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-1.5 bg-[#3b82f6] inline-block rounded-sm" />
                                      <span className="text-slate-400">Complexity</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Chronological list layout */}
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {historyMetrics.map((pt, i) => (
                              <div key={i} className="bg-slate-950 border border-card-border p-2.5 rounded-lg flex items-center justify-between font-mono text-[10px]">
                                <div className="space-y-0.5">
                                  <span className="text-white font-bold block">Commit: {pt.commit}</span>
                                  <span className="text-slate-500 text-[9px]">{pt.date}</span>
                                </div>
                                <div className="text-right text-[10px] space-y-0.5">
                                  <span className="text-neon-cyan block">Maint: {pt.maintainability}</span>
                                  <span className="text-slate-400 block">Warnings: {pt.warnings}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-600 font-mono text-[10px]">
                          No timeline scores recorded in ArchAI memory database.
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 4: STAFF ENGINEER REVIEW */}
                  {benchMode === "review" && (
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Executive Staff Review Summary</span>
                      
                      {/* principal review card content */}
                      <div className="glass-panel p-4 rounded-xl border border-neon-cyan/20 space-y-4 font-sans text-xs">
                        <div className="bg-slate-950 p-3 rounded-lg border border-card-border space-y-2">
                          <strong className="block text-neon-cyan uppercase font-mono text-[10px] tracking-wider">Flaw Detection & Coupling Warnings</strong>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            High modular coupling exists between endpoint routers and persistence drivers (SQLite connection poolers). Raw SQL queries bypass service interfaces, exposing structural endpoints directly to schema revisions.
                          </p>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-card-border space-y-2">
                          <strong className="block text-neon-purple uppercase font-mono text-[10px] tracking-wider">Refactoring Recommendations</strong>
                          <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-[10.5px]">
                            <li>Introduce generic Service/Repository classes to isolate database query triggers.</li>
                            <li>Extract database models declarations out of single unified schemas scripts into file groups.</li>
                            <li>Configure Redis cache middlewares to handle user auth profile reads cleanly.</li>
                          </ul>
                        </div>

                        <div className="bg-[#0b0c10] border border-emerald-500/20 p-3 rounded-lg space-y-2">
                          <strong className="block text-emerald-400 uppercase font-mono text-[10px] tracking-wider">Overall Architect Assessment</strong>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            The software exhibits clear folder layer patterns but is tightly coupled in implementation details. Maintainability stands at 65-72% due to cycle dependencies. Fixing database loops should be prioritized first.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 5: GAUNTLET LEADERBOARD */}
                  {benchMode === "gauntlet" && (
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Testing Gauntlet Leaderboard</span>
                      
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-card-border text-[11px] text-slate-400 font-sans leading-relaxed">
                        <p className="text-slate-300">
                          ArchAI tests its entity recognition, cycle solvers, refactoring logic, and blast radius reasoning against standard open-source repositories to prove trust and accuracy.
                        </p>
                      </div>

                      <div className="overflow-x-auto border border-card-border rounded-xl">
                        <table className="w-full text-[10px] font-mono text-left text-slate-400">
                          <thead className="bg-[#0c0c0c] border-b border-card-border text-slate-300 font-bold uppercase text-[8px]">
                            <tr>
                              <th className="p-2.5">Repository</th>
                              <th className="p-2.5 text-center">Quality</th>
                              <th className="p-2.5 text-center">Risk</th>
                              <th className="p-2.5 text-center">Dead</th>
                              <th className="p-2.5 text-center">Cycles</th>
                              <th className="p-2.5 text-center">Refac</th>
                              <th className="p-2.5 text-center">Blast</th>
                              <th className="p-2.5 text-center text-neon-cyan">Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-card-border bg-slate-950/40">
                            {GAUNTLET_LEADERBOARD.map((item, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="p-2.5 font-bold text-white truncate max-w-[100px]">{item.repo}</td>
                                <td className="p-2.5 text-center">{item.quality}%</td>
                                <td className="p-2.5 text-center">{item.risk}%</td>
                                <td className="p-2.5 text-center">{item.deadCode}%</td>
                                <td className="p-2.5 text-center">{item.circular}%</td>
                                <td className="p-2.5 text-center">{item.refactor}%</td>
                                <td className="p-2.5 text-center">{item.blastRadius}%</td>
                                <td className="p-2.5 text-center text-neon-cyan font-bold">{item.overall}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* 5. NATURAL LANGUAGE GRAPH EDITING / CHANGE SIMULATION */}
            {activeTab === "nledit" && (
              <div className="flex-1 flex flex-col justify-between text-xs space-y-4 min-h-0">
                <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                  
                  {/* Mode switcher select */}
                  <div className="flex bg-[#0c0c0c] border border-card-border rounded-lg p-0.5 text-[10px] font-bold">
                    <button 
                      onClick={() => setEditTabMode("edit")}
                      className={`flex-1 py-1.5 rounded-md transition-all ${editTabMode === "edit" ? "bg-neon-green text-black" : "text-slate-500 hover:text-white"}`}
                    >
                      Edit Canvas
                    </button>
                    <button 
                      onClick={() => setEditTabMode("simulate")}
                      className={`flex-1 py-1.5 rounded-md transition-all ${editTabMode === "simulate" ? "bg-neon-green text-black" : "text-slate-500 hover:text-white"}`}
                    >
                      Simulate Change
                    </button>
                  </div>

                  {editTabMode === "edit" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-card-border pb-2">
                        <span className="font-extrabold uppercase text-[10px] text-slate-400">Natural Language Design Editor</span>
                      </div>

                      <p className="text-slate-400">Enter architectural instructions to live-edit the center canvas. I will insert service nodes, resolve connections, and rewrite diagrams automatically.</p>
                      
                      <div className="p-3 bg-slate-950 rounded-lg border border-card-border space-y-1.5 text-[11px] text-slate-500 font-mono">
                        <span className="block font-bold text-slate-400">Try prompts like:</span>
                        <span>• "Add Redis caching"</span>
                        <span>• "Add API Gateway node linking user routes"</span>
                      </div>

                      {editHistory.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Edit Operations Log:</span>
                          {editHistory.map((h, i) => (
                            <div key={i} className="p-2.5 bg-emerald-950/20 border border-emerald-500/10 rounded-lg text-slate-300 font-mono text-[10px]">
                              {h}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-card-border pb-2">
                        <span className="font-extrabold uppercase text-[10px] text-slate-400">Architectural Change Simulator</span>
                      </div>

                      <p className="text-slate-400">Model hypothetical system additions or structural shifts. Simulate tradeoffs, risks, complexities, and infrastructure costs before modifying code.</p>

                      <div className="p-3 bg-slate-950 rounded-lg border border-card-border space-y-1.5 text-[11px] text-slate-500 font-mono">
                        <span className="block font-bold text-slate-400">Try simulation prompts:</span>
                        <span>• "Add AWS Cognito for corporate SSO login"</span>
                        <span>• "Migrate from SQLite to cluster PostgreSQL datastore"</span>
                        <span>• "Transition order controller handlers to Celery background task workers"</span>
                      </div>

                      {simulationResult && (
                        <div className="space-y-3.5 border-t border-card-border pt-4">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>SIMULATION REPORT: {simulationResult.risk_level} Risk</span>
                            <button
                              onClick={() => {
                                if (simulationResult.after_mermaid) {
                                  setActiveRepo((prev: any) => ({
                                    ...prev,
                                    diagram: {
                                      ...prev.diagram,
                                      mermaid: simulationResult.after_mermaid
                                    }
                                  }));
                                }
                              }}
                              className="text-primary hover:text-white font-bold"
                            >
                              Load to Canvas
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center font-mono text-[10px]">
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-card-border">
                              <span className="block text-slate-500">Complexity Shift</span>
                              <strong className="text-neon-cyan">{simulationResult.complexity_shift}</strong>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-card-border">
                              <span className="block text-slate-500">Estimated Cost</span>
                              <strong className="text-amber-500">{simulationResult.cost_impact}</strong>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Pros</span>
                            <ul className="list-disc pl-4 space-y-1 text-emerald-400 leading-relaxed font-sans text-[11px]">
                              {simulationResult.pros?.map((p: string, i: number) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Cons & Tradeoffs</span>
                            <ul className="list-disc pl-4 space-y-1 text-red-400 leading-relaxed font-sans text-[11px]">
                              {simulationResult.cons?.map((c: string, i: number) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>

                          {simulationResult.mitigation && (
                            <div className="bg-[#0f172a] border border-blue-500/20 p-3 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                              <strong className="block text-blue-400 text-[10px] uppercase font-bold mb-1">Mitigation Strategy</strong>
                              {simulationResult.mitigation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Input form at bottom */}
                {editTabMode === "edit" ? (
                  <form onSubmit={handleNlEditSubmit} className="border-t border-card-border pt-4 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Add Redis cache..." 
                      value={nlEditPrompt}
                      onChange={(e) => setNlEditPrompt(e.target.value)}
                      className="flex-1 bg-black border border-card-border text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-neon-cyan font-mono"
                    />
                    <button type="submit" disabled={isEditingDiagram} className="px-4 py-2 rounded-lg bg-neon-green hover:opacity-95 text-black font-semibold">
                      {isEditingDiagram ? "Editing..." : "Apply"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSimulateChange} className="border-t border-card-border pt-4 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Migrate database to Postgres..." 
                      value={simulationPrompt}
                      onChange={(e) => setSimulationPrompt(e.target.value)}
                      className="flex-1 bg-black border border-card-border text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-neon-green font-mono"
                    />
                    <button type="submit" disabled={isSimulating} className="px-4 py-2 rounded-lg bg-neon-green hover:opacity-95 text-black font-semibold">
                      {isSimulating ? "Simulating..." : "Simulate"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 6. SYSTEM DESIGN COPILOT */}
            {activeTab === "copilot" && (
              <div className="flex-1 flex flex-col justify-between text-xs space-y-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-card-border pb-2">
                    <span className="font-extrabold uppercase text-[10px] text-slate-400">Architecture Copilot</span>
                  </div>

                  <p className="text-slate-400">Generate professional system designs, databases schemas, scaling specifications and sequence flows from text prompts.</p>
                  
                  <div className="p-3 bg-slate-950 rounded-lg border border-card-border text-[11px] text-slate-500 font-mono">
                    <span className="block font-bold text-slate-400 mb-1">Example prompt:</span>
                    <span>"Build Uber for Boats"</span>
                  </div>

                  {copilotSpecs && (
                    <div className="space-y-3 border-t border-card-border pt-4">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Result Spec: {copilotSpecs.prompt}</span>
                        <button 
                          onClick={() => {
                            // Copy copilot diagram to main view
                            if (copilotSpecs.mermaid) {
                              setActiveRepo(prev => ({
                                ...prev,
                                diagram: {
                                  ...prev.diagram,
                                  mermaid: copilotSpecs.mermaid
                                }
                              }));
                            }
                          }}
                          className="text-primary hover:text-white"
                        >
                          Load to Canvas
                        </button>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-card-border whitespace-pre-line text-slate-300 font-sans leading-relaxed prose prose-invert text-[11px]">
                        {copilotSpecs.design}
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleCopilotSubmit} className="border-t border-card-border pt-4 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. Build Uber for Boats..." 
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    className="flex-1 bg-black border border-card-border text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button type="submit" disabled={isGeneratingCopilot} className="px-4 py-2 rounded-lg bg-amber-500 hover:opacity-95 text-black font-semibold">
                    {isGeneratingCopilot ? "Creating..." : "Build"}
                  </button>
                </form>
              </div>
            )}

          </div>
        </aside>
      </div>

      {/* Command Palette dialog (Ctrl+K) */}
      {isCmdOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-xl border border-card-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="bg-[#0b0b0b] p-4 border-b border-card-border flex items-center gap-3">
              <Terminal className="w-5 h-5 text-neon-cyan" />
              <input 
                autoFocus
                type="text" 
                placeholder="Type a shortcut or command (e.g. docs, chat, review)..." 
                className="flex-1 bg-transparent text-sm text-slate-200 outline-none font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsCmdOpen(false);
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.toLowerCase();
                    if (val === "chat") setActiveTab("chat");
                    if (val === "docs") setActiveTab("docs");
                    if (val === "pr" || val === "review") setActiveTab("pr");
                    if (val === "drift" || val === "timeline" || val === "bench") setActiveTab("timeline");
                    if (val === "edit" || val === "nledit") setActiveTab("nledit");
                    if (val === "copilot") setActiveTab("copilot");
                    setIsCmdOpen(false);
                  }
                }}
              />
              <span className="text-[10px] text-slate-500 font-mono">[esc] to close</span>
            </div>
            
            <div className="p-3 text-xs font-mono text-slate-400 space-y-1">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-extrabold pb-2">ArchAI Keyboard Shortcuts</span>
              <div className="flex justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer" onClick={() => { setActiveTab("chat"); setIsCmdOpen(false); }}>
                <span>Activate AI Architect Chat</span>
                <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">chat</kbd>
              </div>
              <div className="flex justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer" onClick={() => { setActiveTab("docs"); setIsCmdOpen(false); }}>
                <span>Toggle Architecture Documentation</span>
                <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">docs</kbd>
              </div>
              <div className="flex justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer" onClick={() => { setActiveTab("pr"); setIsCmdOpen(false); }}>
                <span>Run Pull Request Review Audit</span>
                <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">review</kbd>
              </div>
              <div className="flex justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer" onClick={() => { setActiveTab("timeline"); setIsCmdOpen(false); }}>
                <span>View Architecture Benchmarks</span>
                <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">bench</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
