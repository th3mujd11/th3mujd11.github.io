#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";

const GITHUB_USER = "th3mujd11";
const token = process.env.GH_EVENTS_TOKEN;

if (!token) {
  console.warn("GITHUB_TOKEN not set — writing empty events file");
  mkdirSync("public", { recursive: true });
  writeFileSync("public/github-events.json", "[]");
  process.exit(0);
}

const res = await fetch(
  `https://api.github.com/users/${GITHUB_USER}/events`,
  {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  },
);

if (!res.ok) {
  console.error(`GitHub API error: ${res.status} ${res.statusText}`);
  mkdirSync("public", { recursive: true });
  writeFileSync("public/github-events.json", "[]");
  process.exit(0);
}

const events = await res.json();
mkdirSync("public", { recursive: true });
writeFileSync("public/github-events.json", JSON.stringify(events));
console.log(`Wrote ${events.length} events to public/github-events.json`);
