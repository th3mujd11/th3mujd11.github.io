// Server component to render a study note from /study/<slug>.md
// With comments on every line for clarity

import { listMarkdown, loadMarkdown } from "../../../lib/md"; // import markdown helpers
import { notFound } from "next/navigation"; // helper for 404 rendering

export async function generateStaticParams() { // enumerate slugs for static export
  const files = listMarkdown("study") // list study .md files
    .filter(f => !/^STUDY_TEMPLATE$/i.test(f.slug)); // exclude template
  return files.map(f => ({ slug: f.slug })); // return params array
} // end generateStaticParams

export async function generateMetadata({ params }) { // set page metadata (await params per Next 16)
  const { slug } = await params; // unwrap promise
  try { // attempt load
    const { meta } = loadMarkdown("study", slug); // load meta
    return { title: meta.title || slug }; // title from meta
  } catch { // fallback
    return { title: slug }; // slug as title
  } // end try/catch
} // end generateMetadata

export default async function StudyEntry({ params }) { // default export page (await params)
  const { slug } = await params; // unwrap promise
  if (!slug) return notFound(); // missing slug -> 404
  let html = ""; // default html
  let meta = {}; // default meta
  try { // attempt to load markdown
    const loaded = loadMarkdown("study", slug); // load markdown content
    html = loaded.html; // assign html
    meta = loaded.meta; // assign meta
  } catch { // on missing file or parse error
    return notFound(); // render 404 page
  } // end try/catch
  return ( // render
    <main className="main minimal"> {/* container */}
      <h1 className="minimal-title"> {/* title */}
        {meta.title || slug} {/* displayed title */}
      </h1> {/* end title */}
      {meta.date ? <p className="minimal-sub">{meta.date}</p> : null} {/* optional date */}

      <div className="rule" /> {/* separator */}

      <article dangerouslySetInnerHTML={{ __html: html }} /> {/* markdown HTML content */}
    </main> // end main
  ); // end return
} // end StudyEntry
