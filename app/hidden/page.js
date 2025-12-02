// Server component: lists hidden markdown pages at build time
import { listMarkdown, loadMarkdown } from "../../lib/md";

export const metadata = { title: "Hidden Pages" };

export default function HiddenIndex() {
  const files = listMarkdown("hidden").filter(
    (f) => !/^HIDDEN_TEMPLATE$/i.test(f.slug),
  );

  const items = files.map((f) => {
    let meta = {};
    try {
      meta = loadMarkdown("hidden", f.slug).meta;
    } catch {}
    const title =
      meta.title ||
      f.slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const date = meta.date || null;
    return { ...f, title, date, meta };
  });

  items.sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : 0;
    const db = b.date ? Date.parse(b.date) : 0;
    if (db !== da) return db - da;
    return a.title.localeCompare(b.title);
  });

  return (
    <main className="main minimal">
      <h1 className="minimal-title">Pagina unlisted</h1>
      <p className="minimal-sub">
        Aici se afla lucruri de care am nevoie dar nu le vreau listate
      </p>

      <div className="rule" />

      <section className="section">
        <h2 className="section-h2">All Items</h2>
        <div className="minimal-list">
          {items.length === 0 ? (
            <div className="list-note">No hidden pages yet.</div>
          ) : (
            items.map((i) => (
              <a
                key={i.slug}
                href={`/hidden/${i.slug}`}
                className="minimal-link"
              >
                <span className="list-title">{i.title}</span>
                {i.date ? <span className="list-note"> — {i.date}</span> : null}
              </a>
            ))
          )}
        </div>
      </section>

      <footer className="footer-stick">© th3mujd11 2025</footer>
    </main>
  );
}
