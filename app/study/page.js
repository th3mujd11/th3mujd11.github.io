// Server component: lists study markdown notes and PDF files
// Fully commented for clarity

import { listMarkdown } from "../../lib/md"; // utility to list .md files
import fs from "fs"; // Node filesystem to list PDFs
import path from "path"; // Node path to resolve directories

export default function StudyIndex() { // export default route component
  const notes = listMarkdown("study") // list .md files in /study
    .filter(f => !/^STUDY_TEMPLATE$/i.test(f.slug)); // exclude template
  const pdfDir = path.join(process.cwd(), "public", "study"); // static PDFs go in /public/study
  const pdfs = fs.existsSync(pdfDir) // if directory exists
    ? fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith(".pdf")) // list PDF files
    : []; // else none

  return ( // render page
    <main className="main minimal"> {/* container */}
      <h1 className="minimal-title"> {/* title */}
        📘 Study Materials {/* heading */}
      </h1> {/* end title */}
      <p className="minimal-sub"> {/* subtitle */}
        Markdown notes and PDFs; drop .md in /study and .pdf in /public/study {/* instructions */}
      </p> {/* end subtitle */}

      <div className="rule" /> {/* separator */}

      <section className="section"> {/* notes section */}
        <h2 className="section-h2">Notes (.md)</h2> {/* heading */}
        <div className="minimal-list"> {/* list */}
          {notes.length === 0 ? (
            <div className="list-note">No notes yet. Copy STUDY_TEMPLATE.md to /study and edit.</div>
          ) : (
            notes.map(n => (
              <a key={n.slug} href={`/study/${n.slug}`} className="minimal-link"> {/* link to dynamic md page */}
                <span className="list-title">{n.name}</span> {/* file name */}
              </a>
            ))
          )}
        </div> {/* end list */}
      </section> {/* end notes */}

      <div className="rule" /> {/* separator */}

      <section className="section"> {/* pdf section */}
        <h2 className="section-h2">PDFs</h2> {/* heading */}
        <div className="minimal-list"> {/* list */}
          {pdfs.length === 0 ? (
            <div className="list-note">Place PDF files under /public/study to list them here.</div>
          ) : (
            pdfs.map(p => (
              <a key={p} href={`/study/${encodeURIComponent(p)}`} className="minimal-link"> {/* direct link to static PDF */}
                <span className="list-title">{p}</span> {/* filename */}
                <span className="list-note"> — .pdf</span> {/* type */}
              </a>
            ))
          )}
        </div> {/* end list */}
      </section> {/* end PDFs */}
    </main> // end main
  ); // end return
} // end StudyIndex
