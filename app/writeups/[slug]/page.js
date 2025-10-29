// Server component to render an individual writeup from /writeups/<slug>.md
// Every line includes comments for clarity

import { listMarkdown, loadMarkdown } from "../../../lib/md"; // utilities to list and load markdown
import { notFound } from "next/navigation"; // Next helper to render 404 when content missing

// Ensure static generation only for export mode
export const dynamic = "force-static";
export const dynamicParams = false; // only paths from generateStaticParams

// Pre-generate all writeup slugs for static export
export async function generateStaticParams() { // Next.js build-time function
  const files = listMarkdown("writeups") // list writeup .md files
    .filter(f => !/^WRITEUP_TEMPLATE$/i.test(f.slug)); // exclude the template
  return files.map(f => ({ slug: f.slug })); // return params array like [{slug: "post"}]
} // end generateStaticParams

// Optionally set page metadata from front matter
export async function generateMetadata({ params }) { // Next.js metadata function (await params for Next 16 APIs)
  const { slug } = await params; // unwrap params promise to get slug
  try { // attempt to read meta
    const { meta } = loadMarkdown("writeups", slug); // load markdown meta
    return { title: meta.title || slug }; // use title if present
  } catch { // on error
    return { title: slug }; // fallback to slug
  } // end try/catch
} // end generateMetadata

export default async function WriteupEntry({ params }) { // main page component with slug param (await params)
  const { slug } = await params; // unwrap params promise
  if (!slug) return notFound(); // if slug missing, render 404
  let html = ""; // default html
  let meta = {}; // default meta
  try { // attempt to load markdown file
    const loaded = loadMarkdown("writeups", slug); // load and parse markdown
    html = loaded.html; // html content
    meta = loaded.meta; // front matter
  } catch { // on read/parse error
    return notFound(); // render 404 when file not found
  } // end try/catch
  return ( // render page
    <main className="main minimal"> {/* page container */}
      <h1 className="minimal-title"> {/* heading */}
        {meta.title || params.slug} {/* show title or slug */}
      </h1> {/* end title */}
      {meta.date ? <p className="minimal-sub">{meta.date}</p> : null} {/* optional date */}

      <div className="rule" /> {/* separator */}

      <article dangerouslySetInnerHTML={{ __html: html }} /> {/* markdown HTML */}

      <footer className="footer-stick"> {/* sticky footer */}
        C  Th3mujd11 {/* footer text */}
      </footer> {/* end footer */}
    </main> // end main
  ); // end return
} // end WriteupEntry
