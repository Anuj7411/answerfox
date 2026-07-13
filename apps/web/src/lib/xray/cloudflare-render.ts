import 'server-only';
import type { RenderFn } from './render-adapter';

/**
 * A RenderFn backed by Cloudflare Browser Rendering's REST `/content`
 * endpoint: one authenticated POST returns the page's fully
 * JS-executed HTML. Works from any Node/Vercel route with an account id
 * + API token, no Workers `env.BROWSER` binding.
 *
 * `createCloudflareRender` returns null when creds are absent, the same
 * honest-degradation seam the answer-model uses: the caller reports
 * "render not configured" rather than silently treating a missing
 * backend as an empty page. The adapter is deliberately provider-shaped
 * so a swap to Browserless `/content` (the documented fallback) is a
 * one-line change.
 */

const RENDER_TIMEOUT_MS = 30_000;

export async function cloudflareRenderContent(
  url: string,
  accountId: string,
  apiToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/content`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Cloudflare render HTTP ${response.status}: ${body.slice(0, 200)}`);
    }
    const data = (await response.json()) as {
      success?: boolean;
      result?: string;
      errors?: unknown;
    };
    if (data.success !== true || typeof data.result !== 'string') {
      throw new Error(
        `Cloudflare render failed: ${JSON.stringify(data.errors ?? data).slice(0, 200)}`,
      );
    }
    return data.result;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createCloudflareRender(
  opts: {
    readonly accountId?: string;
    readonly apiToken?: string;
    readonly fetchImpl?: typeof fetch;
  } = {},
): RenderFn | null {
  const accountId = opts.accountId ?? process.env.CLOUDFLARE_ACCOUNT_ID ?? '';
  const apiToken = opts.apiToken ?? process.env.CLOUDFLARE_API_TOKEN ?? '';
  if (accountId.length === 0 || apiToken.length === 0) return null;
  const fetchImpl = opts.fetchImpl ?? fetch;
  return (url: string) => cloudflareRenderContent(url, accountId, apiToken, fetchImpl);
}
