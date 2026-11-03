// Pure helpers for the event page's About / What's included sections.

/** Split a host-written description into paragraphs on blank lines. */
export function descriptionParagraphs(description: unknown): string[] {
  if (typeof description !== 'string') return [];
  return description
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** The API returns `included` as an array; tolerate a JSON string or junk. */
export function normaliseIncluded(raw: unknown): string[] {
  let v: unknown = raw;
  if (typeof v === 'string') {
    try { v = JSON.parse(v); } catch { return []; }
  }
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean);
}

/** The host form's textarea (one item per line) → the `included` array the API expects. */
export function parseIncludedLines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 12);
}
