"use client";

import { useEffect as E, useState as S } from "react";

const R = /<\/?script[^>]*>/gi;
const U = (h) => h.replace(R, "");
const C = String.fromCharCode;
const N = [70, 76, 65, 71].map(C).join("");
const P = (v) => (v ? [...v].map((x) => C(x.charCodeAt(0))).join("") : "");

export default function X() {
  const [a, b] = S("Hello, world!");
  const [c, d] = S("");

  E(() => {
    globalThis[N] = P(process.env.NEXT_PUBLIC_FLAG || "");
    return () => delete globalThis[N];
  }, []);

  E(() => d(U(a)), [a]);

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
          value={a}
          onChange={(e) => b(e.target.value)}
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
          dangerouslySetInnerHTML={{ __html: c }}
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
