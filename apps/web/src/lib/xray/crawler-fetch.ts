import 'server-only';
import type { CrawlerFetchFn } from './run-xray';

/**
 * The real crawler-side fetch: exactly what GPTBot/ClaudeBot receive.
 * Plain, unauthenticated, no JS execution — the free half of X-Ray.
 * Timeout guards against a slow/hanging origin stalling a whole audit.
 */
const GPTBOT_USER_AGENT =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot';
const TIMEOUT_MS = 15_000;

export const fetchCrawlerView: CrawlerFetchFn = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': GPTBOT_USER_AGENT },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Crawler fetch got HTTP ${response.status} for ${url}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
};
