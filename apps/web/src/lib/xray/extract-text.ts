/**
 * Agent-View X-Ray, analytical core (hero H1).
 *
 * Extract the text an AI crawler can actually READ from an HTML
 * payload: no script/style/noscript/template content, tags stripped,
 * whitespace collapsed. This runs on both sides of the diff — the raw
 * no-JS fetch (crawler view) and the browser-rendered DOM (human
 * view) — so the comparison is symmetric by construction.
 */

const STRIP_BLOCKS = /<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1>/gi;
const COMMENTS = /<!--[\s\S]*?-->/g;
const TAGS = /<[^>]+>/g;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

function decodeBasicEntities(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m);
}

/** Visible text of an HTML document, whitespace-normalized. */
export function extractVisibleText(html: string): string {
  const stripped = html.replace(STRIP_BLOCKS, ' ').replace(COMMENTS, ' ').replace(TAGS, ' ');
  return decodeBasicEntities(stripped).replace(/\s+/g, ' ').trim();
}

/**
 * Tokenize into comparable words: lowercase, punctuation-trimmed,
 * single characters dropped (they are markup noise, not content).
 */
export function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((w) => w.length > 1);
}
