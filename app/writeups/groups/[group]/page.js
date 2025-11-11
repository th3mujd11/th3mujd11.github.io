// Server component: renders all writeups inside a computed "folder" (e.g., AC CTF 2025)
// Group label = <event-from-filename> + <year-from-date>

import { listMarkdown, loadMarkdown } from "../../../../lib/md";
import { notFound } from "next/navigation";

function toLabelAndSlug(file) {
  let meta = {};
  try { meta = loadMarkdown("writeups", file.slug).meta; } catch {}
  const raw = (file.name.split("-")[0] || "Misc");
  const metaEvent = (meta.event || meta.ctf || "").toString().trim();
  const event = (metaEvent || raw).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const year = (meta.date && String(meta.date).slice(0,4)) || "";
  const label = `${event}${year ? ` ${year}` : ""}`.trim();
  const slug = `${event} ${year}`.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const title = meta.title || file.slug.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const date = meta.date || null;
  return { label, slug, meta, title, date };
}

export async function generateStaticParams() {
  const files = listMarkdown("writeups");
  // collect unique group slugs
  const groups = new Map();
  for (const f of files) {
    if (/^WRITEUP_TEMPLATE$/i.test(f.slug)) continue;
    const g = toLabelAndSlug(f);
    if (!groups.has(g.slug)) groups.set(g.slug, g);
  }
  return Array.from(groups.values()).map(g => ({ group: g.slug }));
}

export async function generateMetadata({ params }) {
  const { group } = await params;
  const files = listMarkdown("writeups");
  const match = files.map(toLabelAndSlug).find(g => g.slug === group);
  return { title: match?.label || "Writeups" };
}

export default async function GroupPage({ params }) {
  const { group } = await params;
  if (!group) return notFound();

  const files = listMarkdown("writeups").filter(f => !/^WRITEUP_TEMPLATE$/i.test(f.slug));
  const withGroups = files.map(f => ({ file: f, grp: toLabelAndSlug(f) }));
  const groupInfo = withGroups.find(x => x.grp.slug === group)?.grp;
  const items = withGroups.map(x => {
    const { file: f, grp } = x;
    if (grp.slug !== group) return null;
    const g = toLabelAndSlug(f);
    return { slug: f.slug, title: g.title, date: g.date };
  }).filter(Boolean);

  if (items.length === 0) return notFound();

  items.sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : 0;
    const db = b.date ? Date.parse(b.date) : 0;
    if (db !== da) return db - da;
    return a.title.localeCompare(b.title);
  });

  // Derive the label for header
  const label = groupInfo?.label || "CTF";

  return (
    <main className="main minimal">
      <h1 className="minimal-title">{label.trim()}</h1>
      <p className="minimal-sub">
        Grouped writeups for {label.trim()} • <a className="minimal-link" href="/writeups">Back to all writeups</a>
      </p>

      <div className="rule" />

      <section className="section">
        <div className="minimal-list">
          {items.map((w) => (
            <a key={w.slug} href={`/writeups/${w.slug}`} className="minimal-link">
              <span className="list-title">{w.title}</span>
              {w.date ? <span className="list-note"> — {w.date}</span> : null}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
