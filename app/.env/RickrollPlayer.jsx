"use client";

import { useEffect, useState } from "react";
import frameSeq from "./rickroll";

const LINES_PER_FRAME = 36;
const FRAME_RATE = 15;

const frames = (() => {
  const lines = frameSeq.split("\n").map((line) => line.trim());
  const parsedFrames = [];

  for (let i = 0; i < lines.length; i += LINES_PER_FRAME) {
    parsedFrames.push(lines.slice(i, i + LINES_PER_FRAME).join("\n"));
  }

  return parsedFrames;
})();

export default function RickrollPlayer() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, 1000 / FRAME_RATE);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="rickroll-screen">
      <pre aria-label="ASCII Rick Astley">{frames[frameIndex]}</pre>

      <a
        aria-label="View ascii-rickroll-js on GitHub"
        className="repo-link"
        href="https://github.com/juxtopposed/ascii-rickroll-js"
        target="_blank"
        rel="noreferrer noopener"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="var(--fill)"
        >
          <path d="M480-280q17 0 28.5-11.5T520-320v-160q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480v160q0 17 11.5 28.5T480-280Zm0-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
        </svg>
      </a>

      <style jsx>{`
        .rickroll-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgb(10, 10, 10);
          position: relative;
        }

        pre {
          margin: 0;
          color: rgb(244, 244, 244);
          font-family: "Courier New", monospace;
          white-space: pre-wrap;
          line-height: 1.2;
          font-size: 1vw;
        }

        @media only screen and (max-width: 1500px) {
          pre {
            font-size: 1.5vw;
          }
        }

        @media only screen and (max-width: 1000px) {
          pre {
            font-size: 2vw;
          }
        }

        .repo-link {
          --fill: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          position: fixed;
          top: 0;
          right: 0;
          padding: 2rem;
        }

        .repo-link:hover {
          --fill: #fff;
        }
      `}</style>

      <style jsx global>{`
        body {
          background: rgb(10, 10, 10);
          color: rgb(244, 244, 244);
          font-family: "Courier New", monospace;
        }

        body::after {
          display: none;
        }
      `}</style>
    </main>
  );
}
