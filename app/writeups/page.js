// Server component: renders available Markdown writeups and study files at build-time
import { listMarkdown } from "../../lib/md"; // import utility to list .md files
import path from "path"; // Node path to resolve directories
import fs from "fs"; // Node filesystem to check study PDFs

export default function WriteupsPage() { // export default component for /writeups route
  const writeups = listMarkdown("writeups") // list .md files in writeups directory
    .filter(f => !/^WRITEUP_TEMPLATE$/i.test(f.slug)); // exclude the template from the index

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
        <div className="minimal-list"> {/* flat list */}
          {writeups.length === 0 ? ( // if no writeups found
            <div className="list-note">No writeups yet.</div> // hint message
          ) : (
            writeups.map((w) => ( // iterate items
              <a key={w.slug} href={`/writeups/${w.slug}`} className="minimal-link"> {/* link to dynamic page */}
                <span className="list-title">{w.name}</span> {/* show filename as title for now */}
              </a> // end link
            ))
          )}
        </div> {/* end minimal list */}
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
