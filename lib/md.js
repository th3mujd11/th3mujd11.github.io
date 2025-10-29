// Minimal Markdown utilities for static export rendering
// All lines are commented for clarity per your request

import fs from "fs"; // Node filesystem module to read files
import path from "path"; // Node path module to resolve directories and file paths

// Parse simple YAML front matter delimited by --- lines at the top of a file
export function parseFrontMatter(raw) { // accepts raw file contents as a string
  if (!raw.startsWith("---")) return { meta: {}, body: raw }; // if no front matter, return empty meta and full body
  const end = raw.indexOf("\n---"); // locate closing delimiter
  if (end === -1) return { meta: {}, body: raw }; // if not found, treat as plain content
  const header = raw.slice(3, end).trim(); // extract header text between --- and ---
  const body = raw.slice(end + 4).replace(/^\s*\n/, ""); // extract body after header and trim first newline
  const meta = {}; // initialize metadata object
  header.split(/\r?\n/).forEach((line) => { // iterate header lines
    const idx = line.indexOf(":"); // find key:value separator
    if (idx === -1) return; // skip malformed lines
    const key = line.slice(0, idx).trim(); // extract key
    let val = line.slice(idx + 1).trim(); // extract value
    if (val.startsWith("[") && val.endsWith("]")) { // simple array like [a, b]
      val = val.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean); // parse into array of strings
    } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1); // remove surrounding quotes
    }
    meta[key] = val; // assign parsed value into meta
  }); // end header lines
  return { meta, body }; // return metadata and body string
} // end parseFrontMatter

// Basic HTML escape to prevent raw HTML injection from Markdown text
function escapeHtml(s) { // accepts string
  return s
    .replace(/&/g, "&amp;") // escape ampersand
    .replace(/</g, "&lt;") // escape less-than
    .replace(/>/g, "&gt;") // escape greater-than
    .replace(/\"/g, "&quot;") // escape double quotes
    .replace(/'/g, "&#39;"); // escape single quotes
} // end escapeHtml

// Convert a subset of Markdown to HTML (headings, lists, code blocks, links, emphasis)
export function markdownToHtml(md) { // accepts markdown text
  // normalize line endings
  let text = md.replace(/\r\n?/g, "\n"); // unify newlines to \n
  // handle fenced code blocks ```lang ... ```
  const codeBlocks = []; // store code block contents to re-insert later
  text = text.replace(/```([\s\S]*?)```/g, (_m, code) => { // match triple backtick blocks
    codeBlocks.push(code); // store raw code
    return `{{{CODE_${codeBlocks.length - 1}}}}`; // placeholder token
  }); // end fenced code replacement

  // split into lines for block processing
  const lines = text.split("\n"); // array of lines
  let html = ""; // accumulate HTML output
  let inUl = false; // whether we are inside a <ul>
  let inOl = false; // whether inside an <ol>

  function closeLists() { // helper to close any open lists
    if (inUl) { html += "</ul>"; inUl = false; } // close unordered list
    if (inOl) { html += "</ol>"; inOl = false; } // close ordered list
  } // end closeLists

  for (let i = 0; i < lines.length; i++) { // iterate line by line
    const line = lines[i]; // current line
    if (/^\s*$/.test(line)) { // blank line
      closeLists(); // close lists before paragraph break
      continue; // skip adding an empty paragraph
    } // end blank line

    // headings: #, ##, ###
    let m = line.match(/^(#{1,6})\s+(.*)$/); // match heading syntax
    if (m) { // if heading
      closeLists(); // close lists before headings
      const level = Math.min(6, m[1].length); // determine heading level
      const content = inlineFormat(m[2]); // format inline elements
      html += `<h${level}>${content}</h${level}>`; // append heading HTML
      continue; // next line
    } // end heading

    // ordered list: 1. item
    if (/^\d+\.\s+/.test(line)) { // match ordered list item
      if (!inOl) { closeLists(); html += "<ol>"; inOl = true; } // open <ol> if not already
      const item = line.replace(/^\d+\.\s+/, ""); // strip marker
      html += `<li>${inlineFormat(item)}</li>`; // append list item
      continue; // next line
    } // end ordered list item

    // unordered list: - item or * item
    if (/^[\-*]\s+/.test(line)) { // match unordered list item
      if (!inUl) { closeLists(); html += "<ul>"; inUl = true; } // open <ul> if not already
      const item = line.replace(/^[\-*]\s+/, ""); // strip marker
      html += `<li>${inlineFormat(item)}</li>`; // append list item
      continue; // next line
    } // end unordered list item

    // paragraph: any other line
    closeLists(); // ensure lists are closed
    html += `<p>${inlineFormat(line)}</p>`; // append paragraph with inline formatting
  } // end loop

  closeLists(); // close any list left open

  // restore code blocks: replace tokens with escaped code
  html = html.replace(/\{\{\{CODE_(\d+)\}\}\}/g, (_m, idx) => { // find tokens
    const code = escapeHtml(codeBlocks[Number(idx)] || ""); // escape code
    return `<pre><code>${code}</code></pre>`; // render block
  }); // end restore

  return html; // return final HTML string
} // end markdownToHtml

// Inline formatting: links, bold, italic, inline code
function inlineFormat(s) { // accepts raw text line
  let out = escapeHtml(s); // escape HTML first
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); // bold **text**
  out = out.replace(/\*(.+?)\*/g, "<em>$1</em>"); // italic *text*
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>"); // inline code `text`
  out = out.replace(/\[(.+?)\]\((https?:[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>'); // links [text](http...)
  return out; // return transformed string
} // end inlineFormat

// Utility: list .md files in a directory (non-recursive)
export function listMarkdown(dir) { // accepts directory path
  const abs = path.join(process.cwd(), dir); // resolve to absolute path from project root
  if (!fs.existsSync(abs)) return []; // if directory does not exist return empty list
  return fs.readdirSync(abs) // read directory entries synchronously
    .filter(f => f.toLowerCase().endsWith(".md")) // keep only .md files
    .map(f => ({ name: f, slug: f.replace(/\.md$/i, "") })); // return file name and slug
} // end listMarkdown

// Utility: read a markdown file and parse front matter and HTML
export function loadMarkdown(dir, slug) { // accepts directory and slug (filename without .md)
  const primary = path.join(process.cwd(), dir, `${slug}.md`); // compose full path from project root
  const alt = path.join(dir, `${slug}.md`); // alternative relative path
  const file = fs.existsSync(primary) ? primary : (fs.existsSync(alt) ? alt : null); // pick existing path
  if (!file) throw new Error(`Markdown not found: ${dir}/${slug}.md`); // throw if file does not exist
  const raw = fs.readFileSync(file, "utf8"); // read file contents as UTF-8 text
  const { meta, body } = parseFrontMatter(raw); // parse front matter
  const html = markdownToHtml(body); // convert body markdown to HTML
  return { meta, html, raw, slug }; // return parsed metadata and HTML string
} // end loadMarkdown
