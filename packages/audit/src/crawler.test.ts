import { InvalidUrlError } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { CrawlError, DEFAULT_USER_AGENT, fetchAndParse } from './crawler.js';

function makeFetch(opts: {
  status?: number;
  body?: string;
  finalUrl?: string;
  capture?: { request?: Request | undefined };
  throwError?: unknown;
}): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (opts.throwError !== undefined) {
      throw opts.throwError;
    }
    if (opts.capture) {
      // Capture the actual init so the test can assert on headers.
      opts.capture.request = new Request(input as string, init);
    }
    return new Response(opts.body ?? '<html><head></head></html>', {
      status: opts.status ?? 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }) as unknown as typeof fetch;
}

describe('fetchAndParse', () => {
  it('returns html + cheerio DOM + status on a 200 OK', async () => {
    const html = '<html><head><title>Hi</title></head></html>';
    const result = await fetchAndParse('https://example.com', {
      fetchImpl: makeFetch({ body: html }),
    });
    expect(result.status).toBe(200);
    expect(result.html).toContain('<title>Hi</title>');
    expect(result.dom('title').text()).toBe('Hi');
    expect(result.url).toBe('https://example.com');
  });

  it('sets a polite User-Agent header by default', async () => {
    const capture: { request?: Request } = {};
    await fetchAndParse('https://example.com', { fetchImpl: makeFetch({ capture }) });
    expect(capture.request?.headers.get('User-Agent')).toBe(DEFAULT_USER_AGENT);
  });

  it('lets callers override the User-Agent', async () => {
    const capture: { request?: Request } = {};
    await fetchAndParse('https://example.com', {
      fetchImpl: makeFetch({ capture }),
      userAgent: 'TestBot/1.0',
    });
    expect(capture.request?.headers.get('User-Agent')).toBe('TestBot/1.0');
  });

  it('throws InvalidUrlError on a non-http URL', async () => {
    await expect(fetchAndParse('ftp://example.com')).rejects.toBeInstanceOf(InvalidUrlError);
  });

  it('throws CrawlError on a 4xx response with the HTTP status attached', async () => {
    try {
      await fetchAndParse('https://example.com', {
        fetchImpl: makeFetch({ status: 404 }),
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(CrawlError);
      expect((e as CrawlError).httpStatus).toBe(404);
      expect((e as CrawlError).url).toBe('https://example.com');
    }
  });

  it('throws CrawlError on a 5xx response', async () => {
    await expect(
      fetchAndParse('https://example.com', { fetchImpl: makeFetch({ status: 503 }) }),
    ).rejects.toBeInstanceOf(CrawlError);
  });

  it('wraps network failures in CrawlError with the cause preserved', async () => {
    const networkErr = new TypeError('fetch failed: ENOTFOUND');
    try {
      await fetchAndParse('https://example.com', {
        fetchImpl: makeFetch({ throwError: networkErr }),
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(CrawlError);
      expect((e as CrawlError).cause).toBe(networkErr);
    }
  });
});
