# Contributing to ArchAI

Thank you for your interest in contributing to ArchAI! We welcome contributions from developers of all experience levels.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

By participating in this project, you agree to be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

---

## How to Contribute

There are many ways to contribute:

| Type | Description |
|---|---|
| 🐛 **Bug Reports** | Found something broken? Open an issue |
| 💡 **Feature Requests** | Have an idea? Share it via a discussion |
| 📝 **Documentation** | Improve README, comments, or guides |
| 🔧 **Code** | Fix bugs, implement features, write tests |
| 🧪 **Testing** | Add test cases or improve coverage |
| 🌍 **Translations** | Translate UI labels and documentation |

---

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Fork & Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/archai.git
cd archai
git remote add upstream https://github.com/dharmitshah/archai.git
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
# Add your GEMINI_API_KEY to .env
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Run Locally

Terminal 1 (backend):
```bash
cd backend && uvicorn main:app --reload --port 8000
```

Terminal 2 (frontend):
```bash
cd frontend && npm run dev
```

---

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** with clear, focused commits:
   ```bash
   git commit -m "feat: add blast radius export to CSV"
   git commit -m "fix: handle empty repository gracefully"
   ```

3. **Run tests** before submitting:
   ```bash
   # Backend
   cd backend && python -m pytest tests/ -v
   
   # Frontend build check
   cd frontend && npm run build
   ```

4. **Open a Pull Request** against `main`:
   - Fill in the PR template
   - Reference any related issues (`Closes #123`)
   - Add screenshots for UI changes

5. **Respond to review feedback** promptly

We aim to review all PRs within **48 hours**.

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use For |
|---|---|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Build, CI, dependency updates |

---

## Code Style

### Python (Backend)

- Follow **PEP 8**
- Use type hints everywhere
- Maximum line length: 100 characters
- Docstrings for all public functions

```python
def analyze_dependency(source: str, target: str) -> DependencyResult:
    """
    Analyze the dependency relationship between two modules.
    
    Args:
        source: The source module path
        target: The target module path
    
    Returns:
        DependencyResult with risk score and metadata
    """
    ...
```

### TypeScript (Frontend)

- Strict TypeScript — no `any` types
- Component props must have explicit interfaces
- Use functional components with hooks

---

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- ArchAI version / commit hash
- Operating system
- Python and Node.js versions
- Steps to reproduce
- Expected vs actual behavior
- Error messages / stack traces

---

## Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and describe:

- The problem you're trying to solve
- Your proposed solution
- Alternative approaches considered
- Any relevant examples from other tools

---

## Questions?

Open a [GitHub Discussion](https://github.com/dharmitshah/archai/discussions) for anything not covered here.

---

Thank you for making ArchAI better! 🚀
