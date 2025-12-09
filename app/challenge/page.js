"use client";

import { useEffect as E, useState as S } from "react";

const X = (c) => String.fromCharCode(c);
const Y = (s) => [...s].map((v) => X(v.charCodeAt(0))).join("");
const Z = (p) => new RegExp(p, "gi");
const R = Z("<\\/?script[^>]*>");
const U = (h) => h.replace(R, "");
const N = X(70) + X(76) + X(65) + X(71);

export default function Q() {
  const [[t, u], [p, l]] = [S("Hello, world!"), S("")];

  E(() => {
    const f = Y(process.env.NEXT_PUBLIC_FLAG || "");
    globalThis[N] = f;
    return () => delete globalThis[N];
  }, []);

  E(() => l(U(t)), [t]);

  return (
    <main className="main minimal">
      <h1 className="minimal-title">🕵️ Web Challenge: Bio Preview</h1>
      <p className="minimal-sub">
        Objective: Make the page execute JavaScript that reads window.FLAG and displays it.
      </p>

      <div className="rule" />

      <section className="section">
        <h2 className="section-h2">Your Bio (HTML allowed)</h2>
        <textarea
          value={t}
          onChange={(e) => u(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
          placeholder="Write some HTML..."
        />
      </section>

      <div className="rule" />

      <section className="section">
        <h2 className="section-h2">Preview</h2>
        <div
          style={{ border: "1px dashed var(--border)", padding: "10px", borderRadius: 8 }}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      </section>

      <div className="rule" />

      <section className="section">
        <h2 className="section-h2">Hints</h2>
        <ul className="thanks-list">
          <li>No network requests needed; everything runs in your browser.</li>
          <li>script tags are stripped, but event attributes aren&apos;t.</li>
          <li>Try attributes like onerror or SVG onload.</li>
          <li>Goal: alert(window.FLAG)</li>
        </ul>
      </section>

      <footer className="footer-stick">© th3mujd11 2025</footer>
    </main>
  );
}
