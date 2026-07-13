import { describe, expect, it } from 'vitest';
import { cloudflareRenderContent, createCloudflareRender } from './cloudflare-render';

function fakeFetch(body: unknown, status = 200): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })) as unknown as typeof fetch;
}

describe('createCloudflareRender', () => {
  it('returns null when creds are missing (honest not-configured)', () => {
    expect(createCloudflareRender({ accountId: '', apiToken: 't' })).toBeNull();
    expect(createCloudflareRender({ accountId: 'a', apiToken: '' })).toBeNull();
  });

  it('returns a RenderFn when both creds are present', () => {
    const render = createCloudflareRender({
      accountId: 'a',
      apiToken: 't',
      fetchImpl: fakeFetch({ success: true, result: '<html>ok</html>' }),
    });
    expect(typeof render).toBe('function');
  });
});

describe('cloudflareRenderContent', () => {
  it('returns the rendered HTML from a success envelope', async () => {
    const html = await cloudflareRenderContent(
      'https://x.com',
      'a',
      't',
      fakeFetch({ success: true, result: '<html>rendered</html>' }),
    );
    expect(html).toBe('<html>rendered</html>');
  });

  it('throws on a non-ok HTTP status', async () => {
    await expect(
      cloudflareRenderContent('https://x.com', 'a', 't', fakeFetch({}, 403)),
    ).rejects.toThrow(/Cloudflare render HTTP 403/);
  });

  it('throws when the envelope is not a success', async () => {
    await expect(
      cloudflareRenderContent(
        'https://x.com',
        'a',
        't',
        fakeFetch({ success: false, errors: [{ message: 'nope' }] }),
      ),
    ).rejects.toThrow(/Cloudflare render failed/);
  });
});
