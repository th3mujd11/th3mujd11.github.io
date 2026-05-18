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
const pushEvents = events.filter((e) => e.type === "PushEvent");
console.log(`Found ${pushEvents.length} PushEvents out of ${events.length} total`);

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

// Enrich push events that have no commits by fetching the head commit
for (const ev of pushEvents) {
  if (ev.payload.commits?.length) continue;
  const sha = ev.payload.head;
  const repo = ev.repo?.name;
  if (!sha || !repo) continue;
  try {
    const commitRes = await fetch(
      `https://api.github.com/repos/${repo}/commits/${sha}`,
      { headers },
    );
    if (commitRes.ok) {
      const data = await commitRes.json();
      ev.payload.commits = [
        {
          sha: data.sha,
          message: data.commit?.message || "No message",
          author: data.commit?.author || {},
        },
      ];
    }
  } catch {}
}

mkdirSync("public", { recursive: true });
writeFileSync("public/github-events.json", JSON.stringify(pushEvents));
console.log(`Wrote ${pushEvents.length} push events to public/github-events.json`);
