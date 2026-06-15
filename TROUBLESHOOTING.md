# Troubleshooting Guide

Solutions to the most common issues when running ArchAI.

---

## Backend Issues

### `uvicorn: command not found`

**Cause**: Virtual environment not activated or dependencies not installed.

**Fix**:
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000
```

---

### `GEMINI_API_KEY not found` / AI responses say "API key missing"

**Cause**: The `.env` file is missing or in the wrong location.

**Fix**:
```bash
# The .env file must be inside backend/
ls backend/.env   # Should exist

# If missing:
cp .env.example backend/.env
# Then edit backend/.env and add your key:
# GEMINI_API_KEY=your_key_here
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

---

### `git.exc.GitCommandNotFound: git`

**Cause**: Git is not installed on your system.

**Fix**:
- **Ubuntu**: `sudo apt install git`
- **macOS**: `brew install git` or install Xcode Command Line Tools
- **Windows**: Download from https://git-scm.com

---

### `Failed to clone repository` → Falls back to mock codebase

**Causes**:
1. Repository URL is incorrect
2. Repository is private
3. Git timeout (large repo)
4. Network issue

**Fix**:
1. Verify the URL opens in your browser
2. Only public repositories are supported currently
3. Increase timeout: add `GIT_CLONE_TIMEOUT=300` to `backend/.env`
4. Check your internet connection

---

### `sqlite3.OperationalError: no such table`

**Cause**: Database schema was not initialized.

**Fix**:
```bash
cd backend
# Delete the old database and restart the server
rm archai.db
uvicorn main:app --port 8000 --reload
```

The server will re-initialize the schema on startup.

---

### `HTTPException: Invalid repository URL`

**Cause**: The URL does not point to a supported git host.

**Supported hosts**: `github.com`, `gitlab.com`, `bitbucket.org`, `codeberg.org`

**Fix**: Use a URL from one of the supported hosts. For demo mode, type `demo` or `fastapi` instead of a URL.

---

### Backend starts but returns 500 errors

**Cause**: Likely a missing or invalid `GEMINI_API_KEY`.

**Debug**:
```bash
# Check the backend logs in the terminal running uvicorn
# Look for lines like:
# [ERROR] archai: Gemini API call failed: ...
```

---

## Frontend Issues

### `npm run dev` fails with `Module not found`

**Fix**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### Frontend loads but graph is empty after analysis

**Causes**:
1. Backend is not running
2. CORS mismatch

**Fix**:
1. Ensure the backend is running: `curl http://localhost:8000/api/health`
2. Check `CORS_ORIGINS` in `backend/.env` matches your frontend URL

---

### `TypeError: Cannot read properties of undefined` in browser console

**Cause**: The API returned an unexpected shape (likely a backend error).

**Fix**:
1. Open the browser DevTools → Network tab
2. Find the failed API request
3. Check the response body for the error message
4. Cross-reference with the backend terminal logs

---

### The React Flow graph is blank / white

**Cause**: React Flow sometimes needs explicit dimensions.

**Fix**: Hard-refresh the page (`Ctrl+Shift+R` / `Cmd+Shift+R`) and re-run the analysis.

---

## Performance Issues

### Analysis is very slow for large repos

**Recommendations**:
- Add `MAX_FILES_PER_REPO=2000` to `backend/.env` to cap file count
- Use `depth=1` cloning (already default) to minimize clone time
- Run the backend on an SSD for faster file I/O

---

### AI chat responses are slow

**Cause**: Gemini API latency, or a very large context being sent.

**Fix**: This is normal for complex repos. The backend streams context to Gemini. For faster responses, use simpler, more focused questions.

---

## Common Error Codes

| HTTP Code | Meaning | Common Fix |
|---|---|---|
| 400 | Invalid repository URL | Use a supported public git host URL |
| 404 | Repository or resource not found | Re-analyze the repository |
| 500 | Backend internal error | Check backend logs for details |
| 503 | Service unavailable | Backend may be starting up — wait 5s and retry |

---

## Still stuck?

1. Check the [FAQ](FAQ.md)
2. Search [GitHub Issues](https://github.com/dharmitshah/archai/issues)
3. Open a new issue with your error message, OS, Python/Node versions, and backend logs
