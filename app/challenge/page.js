"use client"; // client-side page for interactive challenge

// simple, intentionally-vulnerable web challenge (XSS) for viewers
// Goal for players: render an alert showing the hidden flag value.
// Rules: The preview sanitizes only <script> tags, not event handlers.
// Hint: Consider non-script event attributes or SVG-based payloads.

import { useEffect, useMemo, useState } from "react"; // import hooks for state and effects

export default function Challenge() { // export the challenge page component
  const [input, setInput] = useState("Hello, world!"); // user-provided HTML snippet
  const [sanitized, setSanitized] = useState(""); // sanitized HTML that gets rendered

  // expose a flag intentionally to the global scope for the challenge
  useEffect(() => { // run on mount
    // eslint-disable-next-line no-undef
    window.FLAG = "CTF{try harder}"; // challenge flag – retrieve via XSS
    return () => { delete window.FLAG; }; // cleanup on unmount
  }, []); // empty dependency array ensures run once

  // naive sanitizer: strips <script> tags but leaves attributes intact
  const naiveSanitize = (html) => { // function to sanitize raw HTML
    return html.replace(/<\/?script[^>]*>/gi, ""); // remove script tags case-insensitively
  }; // end naiveSanitize

  useEffect(() => { // recompute sanitized HTML whenever input changes
    setSanitized(naiveSanitize(input)); // set sanitized HTML string
  }, [input]); // dependency on input

  const onChange = (e) => setInput(e.target.value); // update input state from textarea

  return ( // render page
    <main className="main minimal"> {/* container */}
      <h1 className="minimal-title"> {/* page title */}
        🕵️ Web Challenge: Bio Preview {/* heading */}
      </h1> {/* end title */}
      <p className="minimal-sub"> {/* subtitle/instructions */}
        Objective: Make the page execute JavaScript that reads window.FLAG and displays it. {/* instructions */}
      </p> {/* end subtitle */}

      <div className="rule" /> {/* separator */}

      <section className="section"> {/* input section */}
        <h2 className="section-h2">Your Bio (HTML allowed)</h2> {/* label */}
        <textarea
          value={input} // controlled value binding
          onChange={onChange} // update handler
          rows={6} // height in rows
          style={{ width: "100%" }} // full width
          placeholder="Write some HTML..." // placeholder text
        /> {/* end textarea */}
      </section> {/* end input */}

      <div className="rule" /> {/* separator */}

      <section className="section"> {/* preview section */}
        <h2 className="section-h2">Preview</h2> {/* label */}
        <div
          style={{ border: "1px dashed var(--border)", padding: "10px", borderRadius: 8 }} // simple framed preview box
          dangerouslySetInnerHTML={{ __html: sanitized }} // intentionally unsafe render for challenge
        /> {/* end preview */}
      </section> {/* end preview section */}

      <div className="rule" /> {/* separator */}

      <section className="section"> {/* hints section */}
        <h2 className="section-h2">Hints</h2> {/* heading */}
        <ul className="thanks-list"> {/* reuse list styling */}
          <li>No network requests needed; everything runs in your browser.</li> {/* hint 1 */}
          <li>script tags are stripped, but event attributes aren&apos;t.</li> {/* hint 2 */}
          <li>Try attributes like onerror or SVG onload.</li> {/* hint 3 */}
          <li>Goal: alert(window.FLAG)</li> {/* hint 4 */}
        </ul> {/* end hints */}
      </section> {/* end hints section */}

      <footer className="footer-stick"> {/* sticky footer */}
        © th3mujd11 2025 {/* footer text */}
      </footer> {/* end footer */}
    </main> // end main
  ); // end return
} // end Challenge component
