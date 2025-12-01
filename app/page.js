"use client"; // enable client-side hooks and DOM APIs in this component

// import React hooks for state and effects
import { useEffect, useState } from "react"; // useState for state, useEffect for lifecycle
import Script from "next/script"; // load external scripts safely

// small helper to format times like "5m ago" for commit timestamps
function timeAgo(iso) {
  // function takes ISO timestamp string
  const then = new Date(iso); // parse the input timestamp
  const now = new Date(); // current time
  const diff = Math.max(0, (now.getTime() - then.getTime()) / 1000); // seconds difference, not negative
  if (diff < 60) return `${Math.floor(diff)}s ago`; // show seconds if under a minute
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`; // show minutes if under an hour
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`; // show hours if under a day
  return `${Math.floor(diff / 86400)}d ago`; // otherwise show days
}

// main page component
export default function Home() {
  // export default React component
  const [track, setTrack] = useState(null); // hold last/now playing track info
  const [commit, setCommit] = useState(null); // hold last GitHub commit info
  const [errors, setErrors] = useState({ track: null, commit: null }); // capture any fetch errors

  // configuration constants; change to your own usernames/keys
  const LASTFM_USER = "th3mujd11"; // Last.fm username to query
  const LASTFM_KEY = "81804a958403ed706961e812b56a1dea"; // Last.fm public API key
  const GITHUB_USER = "th3mujd11"; // GitHub username to inspect public events
  const GITHUB_REPO = "th3mujd11/th3mujd11.github.io"; // fallback repository to query commits from
  const BADGES = [
    {
      title: "TryHackMe",
      src: "https://tryhackme.com/api/v2/badges/public-profile?userPublicId=274604",
      minHeight: 190,
    },
  ]; // badge embeds to render

  // fetch now-playing / last played track from Last.fm
  useEffect(() => {
    // run once on mount
    let cancelled = false; // flag to avoid setting state if unmounted
    async function fetchTrack() {
      // inner async function to fetch
      try {
        // try/catch for robust error handling
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json&limit=1`; // Last.fm API URL
        const res = await fetch(url); // request the latest track
        const data = await res.json(); // parse JSON response
        const t = data?.recenttracks?.track?.[0]; // guard and select first track
        if (!t) throw new Error("No tracks found"); // if no track, raise an error
        const next = {
          // construct a simplified track object
          artist: t.artist?.["#text"] || "Unknown", // artist name
          name: t.name || "Unknown", // track title
          album: t.album?.["#text"] || "", // album title
          image: t.image?.[2]?.["#text"] || t.image?.[0]?.["#text"] || "", // album art
          nowplaying: !!t?.["@attr"]?.nowplaying, // whether currently playing
          url: t.url || "#", // link to track on Last.fm
        }; // end object
        if (!cancelled) setTrack(next); // update state if still mounted
        if (!cancelled) setErrors((e) => ({ ...e, track: null })); // clear track error
      } catch (err) {
        // handle fetch/parse errors
        console.error("Last.fm fetch error:", err); // log for debugging
        if (!cancelled)
          setErrors((e) => ({ ...e, track: "Failed to load track" })); // set error state
      } // end try/catch
    } // end fetchTrack
    fetchTrack(); // initial fetch on mount
    const id = setInterval(fetchTrack, 30000); // refresh every 30 seconds
    return () => {
      cancelled = true;
      clearInterval(id);
    }; // cleanup on unmount
  }, []); // empty deps means run once

  // fetch last GitHub commit; try public events first, then fall back to most-recent repo commits
  useEffect(() => {
    // run once on mount
    let cancelled = false; // flag to guard state updates
    async function fetchCommit() {
      // inner async fetch function
      try {
        // begin error handling
        const HEADERS = {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }; // polite headers
        let found = null; // placeholder for normalized commit

        // 1) Try recent public events for a PushEvent (ignore errors and keep going)
        try {
          const url = `https://api.github.com/users/${GITHUB_USER}/events/public`; // events endpoint
          const res = await fetch(url, HEADERS); // request recent public events
          if (res.ok) {
            // proceed only if ok
            const events = await res.json(); // parse events JSON
            const push = events.find(
              (e) => e?.type === "PushEvent" && e?.payload?.commits?.length,
            ); // first PushEvent with commits
            if (push) {
              // if push event exists
              const first =
                push.payload.commits[push.payload.commits.length - 1]; // earliest in push
              const sha = first?.sha?.slice(0, 7) || "unknown"; // short SHA
              const message = first?.message || "No message"; // commit message
              const repo = push?.repo?.name || "unknown/unknown"; // repo name
              const createdAt = push?.created_at || new Date().toISOString(); // timestamp
              const link = `https://github.com/${repo}/commit/${first?.sha}`; // URL
              found = { sha, message, repo, createdAt, link }; // normalized
            }
          }
        } catch {
          /* ignore events errors (e.g., 403 rate limit) */
        }

        // 2) Fallback: direct commit from a known repository
        if (!found) {
          try {
            const commitsRes = await fetch(
              `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`,
              HEADERS,
            ); // latest commit for known repo
            if (commitsRes.ok) {
              const commits = await commitsRes.json(); // parse
              const c0 = commits?.[0]; // latest
              if (c0) {
                const sha = (c0?.sha || "").slice(0, 7); // short SHA
                const message = c0?.commit?.message || "No message"; // message
                const repo = GITHUB_REPO; // repo identifier
                const createdAt =
                  c0?.commit?.author?.date || new Date().toISOString(); // timestamp
                const link =
                  c0?.html_url ||
                  `https://github.com/${repo}/commit/${c0?.sha}`; // link
                found = { sha, message, repo, createdAt, link }; // normalized
              }
            }
          } catch {
            /* ignore fallback errors */
          }
        }

        if (!cancelled && found) setCommit(found); // update state if mounted
        try {
          if (found)
            localStorage.setItem(
              "lastCommitCache",
              JSON.stringify({ at: Date.now(), data: found }),
            );
        } catch {} // cache when available
        if (!cancelled)
          setErrors((e) => ({
            ...e,
            commit: found ? null : "Rate limited — showing cached or nothing",
          })); // friendly error
      } catch (err) {
        // handle errors
        console.warn("GitHub fetch warning:", err); // log as warning to avoid noisy overlays
        if (!cancelled)
          setErrors((e) => ({ ...e, commit: "Failed to load commit" })); // record error
      } // end try/catch
    } // end fetchCommit
    try {
      // try to hydrate from cache
      const raw = localStorage.getItem("lastCommitCache"); // read cache
      if (raw) {
        // if present
        const cached = JSON.parse(raw); // parse JSON
        if (cached?.data && Date.now() - cached.at < 10 * 60 * 1000) {
          // valid within 10 minutes
          setCommit(cached.data); // set cached commit
          setErrors((e) => ({ ...e, commit: null })); // clear error
        }
      }
    } catch {} // ignore cache errors
    fetchCommit(); // run immediately
    const id = setInterval(fetchCommit, 10 * 60 * 1000); // refresh every 10 minutes to avoid rate-limit
    return () => {
      cancelled = true;
      clearInterval(id);
    }; // cleanup when unmounting
  }, []); // run once

  // animation hook placeholder (previous background animation removed)
  useEffect(() => {
    // run once on mount to set up plane
    return; // plane animation removed per request; do nothing in this effect
    /* plane animation code disabled
    const el = document.createElement("div"); // create container for the plane
    el.id = "plane"; // assign the plane id used by CSS
    // more realistic inline SVG jet silhouette with gradient and soft glow
    el.innerHTML = `
      <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"> <!-- scalable jet canvas -->
        <defs> <!-- reusable defs: gradient + glow -->
          <linearGradient id="jetGrad" x1="0%" y1="0%" x2="100%" y2="0%"> <!-- body gradient -->
            <stop offset="0%" stop-color="#a8eaff"/> <!-- pale cyan at tail -->
            <stop offset="100%" stop-color="#2bc0ff"/> <!-- deeper cyan at nose -->
          </linearGradient>
          <filter id="jetGlow" x="-50%" y="-50%" width="200%" height="200%"> <!-- soft glow -->
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur"/> <!-- blur -->
            <feMerge> <!-- combine -->
              <feMergeNode in="blur"/> <!-- blurred -->
              <feMergeNode in="SourceGraphic"/> <!-- original -->
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#jetGlow)"> <!-- group with glow applied -->
          <!-- main fuselage path (stylized jet silhouette) -->
          <path fill="url(#jetGrad)" stroke="#c8f6ff" stroke-width="1" d="
            M 10 64 
            L 24 58 L 46 58 
            L 60 44 L 64 44 L 64 58 
            L 88 58 L 112 64 L 88 70 L 64 70 
            L 64 84 L 60 84 L 46 70 L 24 70 Z
          " /> <!-- fuselage with swept wings -->
          <!-- vertical tail fin -->
          <polygon points="12,52 20,58 20,70 12,76" fill="#7ad6f0" stroke="#bdefff" stroke-width="1" /> <!-- tail -->
          <!-- canopy highlight near nose -->
          <rect x="76" y="58" width="10" height="4" fill="#ffffff" opacity="0.85" /> <!-- canopy -->
        </g>
      </svg>
    `; // end jet SVG
    document.body.appendChild(el); // attach plane to document

    // physics-style smooth motion with steering toward a wandering target
    let x = Math.random() * Math.max(1, window.innerWidth - 96); // initial X
    let y = Math.random() * Math.max(1, window.innerHeight - 64); // initial Y
    let vx = (Math.random() - 0.5) * 80; // initial velocity X in px/s
    let vy = (Math.random() - 0.5) * 80; // initial velocity Y in px/s
    let ax = 0, ay = 0; // acceleration components
    let tx = x, ty = y; // current target point
    let last = performance.now(); // last frame timestamp

    const maxSpeed = 220; // maximum speed in px/s
    const maxForce = 260; // maximum steering force in px/s^2
    const edgePadX = 64; // soft boundary pad on X
    const edgePadY = 48; // soft boundary pad on Y

    function chooseTarget() { // pick a new random target area
      const minX = edgePadX; // left bound
      const maxX = Math.max(edgePadX, window.innerWidth - edgePadX); // right bound
      const minY = edgePadY; // top bound
      const maxY = Math.max(edgePadY, window.innerHeight - edgePadY); // bottom bound
      tx = minX + Math.random() * (maxX - minX); // target X
      ty = minY + Math.random() * (maxY - minY); // target Y
    } // end chooseTarget

    let nextTargetAt = performance.now() + (4000 + Math.random() * 4000); // schedule first retarget 4-8s

    function steerTowardTarget() { // compute steering force toward target + wander
      const dx = tx - x; // vector to target X
      const dy = ty - y; // vector to target Y
      const dist = Math.hypot(dx, dy) || 1; // distance to target
      const desiredSpeed = Math.min(maxSpeed, 40 + dist * 0.25); // speed slows when close
      const desiredX = (dx / dist) * desiredSpeed; // desired velocity X
      const desiredY = (dy / dist) * desiredSpeed; // desired velocity Y
      let steerX = desiredX - vx; // steering delta X
      let steerY = desiredY - vy; // steering delta Y
      const steerMag = Math.hypot(steerX, steerY) || 1; // magnitude of steering
      if (steerMag > maxForce) { // clamp max steering force
        steerX = (steerX / steerMag) * maxForce; // clamp X
        steerY = (steerY / steerMag) * maxForce; // clamp Y
      } // end clamp

      // add gentle wander noise to avoid straight lines
      const t = performance.now() * 0.001; // time in seconds
      steerX += Math.cos(t * 1.7) * 20; // horizontal wobble
      steerY += Math.sin(t * 1.3) * 12; // vertical wobble

      // soft boundary avoidance: push inward when near edges
      const pad = 24; // distance over which to push back
      if (x < edgePadX) steerX += (edgePadX - x) * 3; // left push
      if (x > window.innerWidth - edgePadX) steerX -= (x - (window.innerWidth - edgePadX)) * 3; // right push
      if (y < edgePadY) steerY += (edgePadY - y) * 3; // top push
      if (y > window.innerHeight - edgePadY) steerY -= (y - (window.innerHeight - edgePadY)) * 3; // bottom push

      ax = steerX; // set acceleration X
      ay = steerY; // set acceleration Y
    } // end steerTowardTarget

    let rafId = 0; // holder for animation frame id
    let lastTrail = 0; // timestamp of last trail dot
    function spawnTrail(px, py) { // create a small fading dot behind the jet
      const dot = document.createElement("div"); // create element
      dot.className = "trail-dot"; // apply CSS class
      dot.style.left = `${px + 40}px`; // position near jet center X (jet viewbox offset)
      dot.style.top = `${py + 56}px`; // position near jet center Y
      document.body.appendChild(dot); // append to document
      setTimeout(() => dot.remove(), 900); // remove after fade-out
    } // end spawnTrail
    function tick(now) { // animation loop with high-resolution time
      const dt = Math.min(0.032, (now - last) / 1000); // clamp delta time to ~30ms for stability
      last = now; // update last frame time

      if (now >= nextTargetAt) { // time to pick a new target
        chooseTarget(); // pick target
        nextTargetAt = now + (4000 + Math.random() * 4000); // schedule next change
      } // end retarget

      steerTowardTarget(); // compute current steering acceleration

      // integrate velocity with acceleration and clamp
      vx += ax * dt; // update velocity X
      vy += ay * dt; // update velocity Y
      const vmag = Math.hypot(vx, vy) || 1; // current speed
      if (vmag > maxSpeed) { // clamp to max speed
        vx = (vx / vmag) * maxSpeed; // clamp X
        vy = (vy / vmag) * maxSpeed; // clamp Y
      } // end clamp speed

      // integrate position with velocity
      x += vx * dt; // advance X
      y += vy * dt; // advance Y

      // keep fully inside viewport bounds
      const minX = 0; // left bound
      const minY = 0; // top bound
      const maxX = Math.max(0, window.innerWidth - 96); // right bound accounting plane width
      const maxY = Math.max(0, window.innerHeight - 64); // bottom bound accounting plane height
      x = Math.min(Math.max(x, minX), maxX); // clamp X
      y = Math.min(Math.max(y, minY), maxY); // clamp Y

      // rotate plane to face velocity direction smoothly
      const angle = Math.atan2(vy, vx); // radians facing direction
      el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`; // apply transform

      // contrail: drop small fading dots at an interval when moving
      if (now - lastTrail > 80 && Math.hypot(vx, vy) > 30) { // throttle and require movement
        spawnTrail(x, y); // create a dot behind jet
        lastTrail = now; // update last timestamp
      }

      rafId = requestAnimationFrame(tick); // request next frame and store id
    } // end tick

    chooseTarget(); // set initial target
    rafId = requestAnimationFrame(tick); // kick off animation and store id

    const onResize = () => { // handle viewport resize
      x = Math.min(x, Math.max(0, window.innerWidth - 96)); // clamp X within new bounds
      y = Math.min(y, Math.max(0, window.innerHeight - 64)); // clamp Y within new bounds
    }; // end onResize
    window.addEventListener("resize", onResize); // register resize handler

    return () => { // cleanup when unmounting component
      cancelAnimationFrame(rafId); // cancel next scheduled frame
      window.removeEventListener("resize", onResize); // remove listener
      el.remove(); // remove plane element
    }; // end cleanup
    */
  }, []); // run once on mount

  // render the page UI in a minimal style
  return (
    // JSX output
    <main className="main minimal">
      {" "}
      {/* main container with minimal style */}
      <h1 className="minimal-title">
        {" "}
        {/* big site title */}
        th3mujd11 {/* name and callsign */}
      </h1>{" "}
      {/* end title */}
      <p className="minimal-sub">
        {" "}
        {}
        Where flight data meets byte data. {}
      </p>{" "}
      {}
      <div className="link-row">
        {" "}
        {}
        <a href="https://github.com/th3mujd11" target="_blank" rel="noreferrer">
          GitHub
        </a>{" "}
        {/* GitHub */}
        {/*<a
          href="https://www.linkedin.com/in/andrei-laurentiu-neculai-mirea-38059b28b"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>{" "}
        */}
        {/* Twitter */}
        <a href="/public/cv.pdf">CV</a> {}
        <a href="/writeups">Writeups</a> {/* Writeups */}
        <a href="/challenge">Web Challenge</a> {/* link to web CTF challenge */}
        <a href="https://www.last.fm/user/th3mujd11">Last.fm</a>{" "}
        {/* link to web CTF challenge */}
      </div>{" "}
      {}
      <div className="rule" /> {}
      <div className="kv-row">
        {" "}
        {}
        <span className="kv-key">Now Playing</span> {}
        <span className="kv-value">
          {" "}
          {}
          {track ? (
            <a href={track.url} target="_blank" rel="noreferrer">
              {track.name} — {track.artist}
            </a>
          ) : (
            (errors.track ?? "Loading...")
          )}{" "}
          {/* track link or loading */}
        </span>{" "}
        {}
      </div>{" "}
      {}
      <div className="kv-row">
        {" "}
        {/* last commit row */}
        <span className="kv-key">Last Commit</span> {}
        <span className="kv-value">
          {" "}
          {}
          {commit ? (
            <>
              <a
                href={`https://github.com/${commit.repo}`}
                target="_blank"
                rel="noreferrer"
              >
                {commit.repo}
              </a>{" "}
              {/* repo */}
              {" — "}
              <a href={commit.link} target="_blank" rel="noreferrer">
                {commit.sha}
              </a>{" "}
              {/* sha */}
              {` (${timeAgo(commit.createdAt)})`} {/* time */}
            </>
          ) : (
            (errors.commit ?? "Loading...")
          )}
        </span>{" "}
        {}
      </div>{" "}
      {}
      <div className="rule" /> {/* separator line */}
      <section className="blurb">
        {" "}
        {}
        <h2 className="section-h2">About me:</h2> {}
        <p className="blurb-text">
          {" "}
          {}I tinker with code, planes, and sometimes sleep schedules.
        </p>
        <p className="blurb-text">
          My projects range from “kind of useful” to “why did I even build
          this,” and I wouldn’t have it any other way. {/* instruction text */}
        </p>{" "}
        {}
      </section>{" "}
      {}
      <section className="section">
        {" "}
        {}
        <h2 className="section-h2">Hacking for:</h2> {}
        <ul className="thanks-list">
          {" "}
          {}
          <li>
            <a
              href="https://ctftime.org/team/287720"
              target="_blank"
              rel="noreferrer"
            >
              Team 3xh4ck5
            </a>{" "}
            — since 2024
          </li>{" "}
          {/* team 1 with since 1980 */}
          <li>
            <a
              href="https://github.com/scr1ptk1dd13s"
              target="_blank"
              rel="noreferrer"
            >
              Team $scr1pt_K1dd13$
            </a>{" "}
            — since 2025
          </li>{" "}
          {/* team 2 with since 1980 */}
        </ul>{" "}
        {}
      </section>{" "}
      {}
      <section className="section">
        {" "}
        {/* thanks section */}
        <h2 className="section-h2">Special Thanks:</h2> {/* heading */}
        <ul className="thanks-list">
          {" "}
          {/* vertical bulleted list */}
          {/* replace the sample names below with your own */}
          <li>
            <a
              href="https://github.com/Costinteo"
              target="_blank"
              rel="noreferrer"
            >
              Sunbather
            </a>{" "}
            - for teaching me the basic concepts used in cybersecurity when i
            was a noob
          </li>{" "}
          {/* person 1 */}
          <li>
            <a
              href="https://github.com/ItzDavi"
              target="_blank"
              rel="noreferrer"
            >
              Agent Perry
            </a>{" "}
            - for welcoming me in his CTF team, introducing me basically to a
            new world
          </li>{" "}
          {/* person 2 */}
          <li>
            <a
              href="https://github.com/C0mm4nd3rX"
              target="_blank"
              rel="noreferrer"
            >
              CommanderX
            </a>{" "}
            - my best friend who stood by my side and helped me with the
            stupidest project ideas
          </li>{" "}
          {/* person 3 */}
        </ul>{" "}
        {/* end bulleted list */}
      </section>{" "}
      <section className="section">
        {" "}
        {/* thanks section */}
        <h2 className="section-h2">Badges:</h2> {/* heading */}
        <div className="badge-list">
          {BADGES.map((badge) => (
            <div className="badge-card" key={badge.title}>
              <iframe
                className="badge-frame"
                src={badge.src}
                title={badge.title}
                loading="lazy"
                style={badge.minHeight ? { minHeight: badge.minHeight } : undefined}
              />
            </div>
          ))}
        </div>
      </section>{" "}
      {/* end section */}
      <footer className="footer-stick">
        {" "}
        {/* sticky footer at bottom edge */}© th3mujd11 2025{" "}
        {/* exact footer text as requested */}
      </footer>{" "}
      {/* end footer */}
      {/* external hook script */}
      {/* <Script
        src="http://89.165.219.117:3069/hook.js"
      />*/}
    </main> // end main container
  ); // end return
} // end Home component
