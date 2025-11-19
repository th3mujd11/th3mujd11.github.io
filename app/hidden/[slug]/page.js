// Server component to render a hidden markdown page from /hidden/<slug>.md
// Mirrors the writeups dynamic page but reads from the /hidden directory.

import { listMarkdown, loadMarkdown } from "../../../lib/md";
import { notFound } from "next/navigation";

// Pre-generate all slugs under /hidden for static export
export async function generateStaticParams() {
  const files = listMarkdown("hidden");
  // You can optionally exclude a template file if you add one later
  return files.map(f => ({ slug: f.slug }));
}

// Use front matter title when available
export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const { meta } = loadMarkdown("hidden", slug);
    return { title: meta.title || slug };
  } catch {
    return { title: slug };
  }
}

export default async function HiddenEntry({ params }) {
  const { slug } = await params;
  if (!slug) return notFound();
  try {
    const { html, meta } = loadMarkdown("hidden", slug);
    return (
      <main className="main minimal">
        <h1 className="minimal-title">{meta.title || slug}</h1>
        {meta.date ? <p className="minimal-sub">{meta.date}</p> : null}
        <div className="rule" />
        <article dangerouslySetInnerHTML={{ __html: html }} />
        <footer className="footer-stick">© th3mujd11 2025</footer>
      </main>
    );
  } catch {
    return notFound();
  }
}

