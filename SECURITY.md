# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x (latest) | ✅ Active |
| < 1.0 | ❌ No longer supported |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in ArchAI, please report it responsibly:

### Option 1: GitHub Private Vulnerability Reporting (Preferred)

Use GitHub's [private vulnerability reporting](https://github.com/dharmitshah/archai/security/advisories/new) feature.

### Option 2: Email

Send a detailed report to: **security@archai.dev**

Include in your report:
- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if you have one)

---

## What to Expect

| Timeline | Action |
|---|---|
| Within 48 hours | Acknowledgement of your report |
| Within 7 days | Initial assessment and severity classification |
| Within 30 days | Fix developed and tested |
| Within 45 days | Patch released and CVE filed (if applicable) |

We follow responsible disclosure — we will credit you in the release notes (unless you prefer anonymity).

---

## Scope

The following are **in scope** for security reports:

- Remote code execution (RCE)
- SQL injection or database exposure
- Authentication bypass
- Server-Side Request Forgery (SSRF) via git clone
- Arbitrary file read/write on the server
- API key exposure
- Cross-site scripting (XSS) in the web interface
- Path traversal vulnerabilities

The following are **out of scope**:

- Attacks requiring physical access to the server
- Social engineering attacks
- Vulnerabilities in third-party dependencies (report those upstream)
- Rate limiting issues without demonstrated impact

---

## Security Best Practices for Self-Hosters

If you are running ArchAI on your own infrastructure:

1. **Never expose the backend directly to the internet** — run it behind a reverse proxy (nginx/Caddy)
2. **Keep your `GEMINI_API_KEY` secret** — never commit `.env` to version control
3. **Use `cloned_repos/` isolation** — consider running in a Docker container to sandbox git clones
4. **Keep dependencies updated** — run `pip install -r requirements.txt --upgrade` regularly
5. **Enable CORS restrictions** — set `CORS_ORIGINS` to your specific frontend domain only

---

## Dependency Security

We regularly audit our dependencies:

- **Backend**: `pip-audit` scans are run on every release
- **Frontend**: `npm audit` is part of our CI pipeline

If you find a vulnerable dependency, please open a regular GitHub issue referencing the CVE.

---

Thank you for helping keep ArchAI secure! 🔒
