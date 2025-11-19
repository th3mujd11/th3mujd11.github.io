// Server component: renders available Markdown writeups and study files at build-time
import { listMarkdown, loadMarkdown } from "../../lib/md"; // import utilities
import path from "path"; // Node path to resolve directories
import fs from "fs"; // Node filesystem to check study PDFs

export default function WriteupsPage() { // export default component for /writeups route
  const writeupFiles = listMarkdown("writeups") // list .md files in writeups directory
    .filter(f => !/^WRITEUP_TEMPLATE$/i.test(f.slug)); // exclude the template from the index

  // Enrich writeups with metadata and a group key based on filename prefix (e.g., AC_CTF)
  const writeups = writeupFiles
    .map(f => {
      let meta = {};
      try { meta = loadMarkdown("writeups", f.slug).meta; } catch {}
      const groupRaw = (f.name.split("-")[0] || "Misc");
      const metaEvent = (meta.event || meta.ctf || "").toString().trim();
      const event = (metaEvent || groupRaw).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const year = (meta.date && String(meta.date).slice(0,4)) || "";
      const group = `${event}${year ? ` ${year}` : ""}`.trim();
      const groupSlug = `${event} ${year}`.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      const title = meta.title || f.slug.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const date = meta.date || null;
      const flag = (meta.hidden ?? meta.unlisted ?? "").toString().toLowerCase();
      const isHidden = flag === "true" || flag === "1" || flag === "yes";
      return { ...f, title, date, group, groupSlug, meta, isHidden };
    })
    .filter(w => !w.isHidden);

  // Group writeups by group label
  const groups = Object.values(writeups.reduce((acc, w) => {
    acc[w.group] = acc[w.group] || { label: w.group, items: [] };
    acc[w.group].items.push(w);
    return acc;
  }, {}));

  // Sort groups alphabetically, and items by date desc then title
  groups.sort((a, b) => a.label.localeCompare(b.label));
  groups.forEach(g => {
    g.items.sort((a, b) => {
      const da = a.date ? Date.parse(a.date) : 0;
      const db = b.date ? Date.parse(b.date) : 0;
      if (db !== da) return db - da;
      return a.title.localeCompare(b.title);
    });
  });

  const studyMd = listMarkdown("study") // list .md files in study directory
    .filter(f => !/^STUDY_TEMPLATE$/i.test(f.slug)); // exclude the template

  const pdfDir = path.join(process.cwd(), "public", "study"); // directory where PDFs should be placed for static export
  const pdfs = fs.existsSync(pdfDir) // ensure directory exists
    ? fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith(".pdf")) // list pdf files
    : []; // otherwise empty

  return ( // render JSX
    <main className="main minimal"> {/* page container with minimal style */}
      <h1 className="minimal-title"> {/* big title */}
        Writeups & Study Hub {/* heading */}
      </h1> {/* end title */}
      <p className="minimal-sub"> {/* description */}
        Some notes from the cockpit:) {/* subtitle */}
      </p> {/* end subtitle */}

      <div className="rule" /> {/* thin separator */}

      <section className="section"> {/* writeups section */}
        <h2 className="section-h2">CTF Writeups</h2> {/* small heading */}
        {groups.length === 0 ? (
          <div className="list-note">No writeups yet.</div>
        ) : (
          groups.map((g) => (
            <div key={g.label} className="writeup-group"> {/* grouped folder-like section */}
              <h3 className="group-title"><a className="minimal-link" href={`/writeups/groups/${g.items[0]?.groupSlug}`}>{g.label}</a></h3>
              <div className="minimal-list">
                {g.items.map((w) => (
                  <a key={w.slug} href={`/writeups/${w.slug}`} className="minimal-link">
                    <span className="list-title">{w.title}</span>
                    {w.date ? <span className="list-note"> — {w.date}</span> : null}
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </section> {/* end writeups section */}

      <div className="rule" /> {/* separator */}

      <section className="section"> {/* study section */}
        <h2 className="section-h2">Study Materials</h2> {/* heading */}
        <div className="minimal-list"> {/* flat list */}
          {studyMd.map((s) => ( // iterate study markdown files
            <a key={s.slug} href={`/study/${s.slug}`} className="minimal-link"> {/* link to dynamic page */}
              <span className="list-title">{s.name}</span> {/* filename */}
              <span className="list-note"> — .md</span> {/* type */}
            </a> // end item
          ))}
          {pdfs.map((p) => ( // iterate PDFs in public/study
            <a key={p} href={`/study/${encodeURIComponent(p)}`} className="minimal-link"> {/* link to static PDF under /study */}
              <span className="list-title">{p}</span> {/* pdf filename */}
              <span className="list-note"> — .pdf</span> {/* type */}
            </a> // end item
          ))}
          {studyMd.length === 0 && pdfs.length === 0 ? ( // if empty
            <div className="list-note">No materials yet.</div> // hint
          ) : null}
        </div> {/* end list */}
      </section> {/* end study section */}

      <footer> {/* footer */}
        © th3mujd11 2025 {/* footer text */}
      </footer> {/* end footer */}
    </main> // end main
  ); // end return
} // end WriteupsPage
