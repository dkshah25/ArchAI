# ArchAI Self-Hosting Guide

This guide covers everything you need to run ArchAI on your own server.

## Table of Contents

- [Requirements](#requirements)
- [Quick Docker Setup](#quick-docker-setup)
- [Manual Setup](#manual-setup)
- [Reverse Proxy Configuration](#reverse-proxy-configuration)
- [Security Hardening](#security-hardening)
- [Updating](#updating)
- [Troubleshooting](#troubleshooting)

---

## Quick Docker Setup

The fastest way to self-host ArchAI — no Python or Node setup needed.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)
- A [Gemini API key](https://aistudio.google.com/app/apikey)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/dharmitshah/archai.git
cd archai

# 2. Set your API key
export GEMINI_API_KEY=your_key_here

# 3. Start everything
docker compose up -d

# 4. Open the app
open http://localhost:3000
```

To stop:
```bash
docker compose down
```

Data (database + cloned repos) is persisted in Docker volumes. To reset everything:
```bash
docker compose down -v
```

---

## Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Disk | 10 GB | 50 GB (for cloned repos) |
| OS | Ubuntu 20.04+ / macOS 12+ / Windows 10+ | Ubuntu 22.04 LTS |

---

## Manual Setup

### 1. Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm git
```

**macOS (Homebrew):**
```bash
brew install python@3.11 node git
```

**Windows:**
- Install Python 3.11+ from [python.org](https://python.org)
- Install Node.js 18+ from [nodejs.org](https://nodejs.org)
- Install Git from [git-scm.com](https://git-scm.com)

### 2. Clone and Configure

```bash
git clone https://github.com/dharmitshah/archai.git
cd archai
cp .env.example backend/.env
```

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
CORS_ORIGINS=https://your-domain.com
```

### 3. Backend

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run build
npm start  # Runs on port 3000
```

---

## Reverse Proxy Configuration

### nginx

```nginx
server {
    listen 80;
    server_name archai.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name archai.yourdomain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;  # Large repos can take time
    }
}
```

---

## Security Hardening

1. **API Key**: Never expose `GEMINI_API_KEY` publicly
2. **CORS**: Set `CORS_ORIGINS` to your exact domain
3. **Firewall**: Only expose ports 80/443 externally; keep 8000/3000 local
4. **Clone isolation**: Consider running in Docker to sandbox git clones
5. **Updates**: Regularly pull latest code and update dependencies

---

## Troubleshooting

### Backend fails to start

```bash
# Check Python version
python --version  # Must be 3.11+

# Check if venv is activated
which python  # Should point to venv

# Check for missing env vars
cat backend/.env
```

### "GEMINI_API_KEY not set" error

Ensure your `.env` file is in the `backend/` directory (not root):
```bash
ls backend/.env
```

### Repository clone fails

- Check disk space: `df -h`
- Check git is installed: `git --version`
- For large repos, increase timeout in `.env`: `GIT_CLONE_TIMEOUT=300`

### Frontend can't reach backend

Ensure `CORS_ORIGINS` in `backend/.env` matches your frontend URL exactly, including the protocol (`http://` vs `https://`).

---

## Updating

```bash
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt --upgrade

# Update frontend
cd ../frontend
npm install
npm run build
```

Then restart both services.
