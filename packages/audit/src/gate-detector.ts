import type { AuditDom } from './parser.js';

/**
 * Detects whether the audited URL is a "logged-out gate page": a public
 * URL whose entire purpose is to push you to sign in. Examples: the
 * root of LinkedIn, GitHub, Gmail, X. These pages are intentionally
 * minimal (no headlines, no content, no JSON-LD) because they're not
 * trying to rank in search.
 *
 * Why we detect it: our 0-100 score under-reports gate pages because
 * they fail many SEO checks (short title, no canonical reasoning, no
 * structured data, etc.) by design. When a user audits one, they read
 * the low score as "this site is bad" instead of "this URL is a login
 * wall." The detector prints a banner above the score line so users
 * understand the context.
 *
 * We do NOT change the score. We add explanation, not penalty
 * adjustment, so the engine stays deterministic and gate pages still
 * surface real fixable issues for sites that want to optimize their
 * gate page anyway.
 */

export interface GatePageDetection {
  readonly isGate: boolean;
  /**
   * Which heuristic signals matched. Useful for debugging and for the
   * banner ("Detected because: short title, password form, no nav").
   * Empty when isGate is false (we don't bother listing signals when
   * the threshold wasn't met).
   */
  readonly signals: readonly string[];
}

const LOGIN_KEYWORDS = [
  'sign in',
  'log in',
  'login',
  'signin',
  'welcome to',
  'welcome back',
  'join now',
  'create account',
];

const TRUST_NAV_HINTS = ['/about', '/pricing', '/docs', '/blog', '/help', '/support'];

const MIN_TITLE_LEN = 30;
const MIN_BODY_WORDS = 200;
const GATE_SIGNAL_THRESHOLD = 3;

/**
 * Run all heuristics against the parsed page. Returns a detection
 * with the matching signal names. A page is classified as a gate when
 * 3 or more of the 5 signals match.
 */
export function detectGatePage(dom: AuditDom): GatePageDetection {
  const signals: string[] = [];

  // Signal 1: title is suspiciously short.
  const title = dom('title').first().text().trim();
  if (title.length > 0 && title.length < MIN_TITLE_LEN) {
    signals.push('short-title');
  }

  // Signal 2: title contains a login keyword.
  const titleLower = title.toLowerCase();
  if (LOGIN_KEYWORDS.some((kw) => titleLower.includes(kw))) {
    signals.push('login-keyword-in-title');
  }

  // Signal 3: page has a password input. This is the strongest signal
  // because login walls always have one, and content pages basically
  // never do.
  if (dom('input[type="password"]').length > 0) {
    signals.push('password-input-present');
  }

  // Signal 4: body word count is very low. Login walls have almost no
  // copy because they're not trying to be read.
  const bodyText = dom('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.length === 0 ? 0 : bodyText.split(' ').length;
  if (wordCount < MIN_BODY_WORDS) {
    signals.push('low-word-count');
  }

  // Signal 5: no trust-nav links (no /about, /pricing, /docs, etc.).
  // Content sites almost always have at least one of these in the
  // header or footer. Gate pages typically don't.
  const hrefs = dom('a[href]')
    .map((_, el) => dom(el).attr('href') ?? '')
    .get();
  const hasTrustNav = hrefs.some((href) => {
    const path = extractPath(href);
    return TRUST_NAV_HINTS.some((hint) => path.startsWith(hint));
  });
  if (!hasTrustNav) {
    signals.push('no-trust-nav-links');
  }

  return {
    isGate: signals.length >= GATE_SIGNAL_THRESHOLD,
    signals,
  };
}

/**
 * Extract the path component from an href. Handles absolute URLs,
 * relative URLs, and hash/query fragments. Returns lowercase for
 * case-insensitive matching.
 */
function extractPath(href: string): string {
  const trimmed = href.trim().toLowerCase();
  if (trimmed.length === 0) return '';
  // Strip protocol + host if absolute.
  const noProtocol = trimmed.replace(/^[a-z]+:\/\/[^/]+/, '');
  // Strip query string and hash.
  const path = noProtocol.split('?')[0]?.split('#')[0] ?? '';
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Format the detection as a human-readable banner string for the
 * console reporter. Returns null when the page isn't classified as
 * a gate (caller emits nothing).
 */
export function formatGateBanner(detection: GatePageDetection): string | null {
  if (!detection.isGate) return null;

  const human: Record<string, string> = {
    'short-title': 'short title',
    'login-keyword-in-title': 'login keyword in title',
    'password-input-present': 'password input on page',
    'low-word-count': 'very little body copy',
    'no-trust-nav-links': 'no /about /pricing /docs links',
  };
  const reasons = detection.signals.map((s) => human[s] ?? s).join(', ');

  return [
    'This URL looks like a logged-out gate page (login wall).',
    'Score under-reports because the page is intentionally minimal.',
    'For actionable results, audit your marketing page (/about, /pricing) or a content page.',
    `Detected because: ${reasons}.`,
  ].join('\n');
}
