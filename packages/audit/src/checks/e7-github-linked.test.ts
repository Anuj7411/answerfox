import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { e7GithubLinked } from './e7-github-linked.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('E7 — GitHub linked', () => {
  it('passes on a github.com link', async () => {
    const r = await e7GithubLinked.run(
      inputFor('<html><body><a href="https://github.com/acme">GitHub</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('passes on github.com regardless of case in href', async () => {
    const r = await e7GithubLinked.run(
      inputFor('<html><body><a href="https://GitHub.com/acme">GitHub</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('warns when no github.com link exists', async () => {
    const r = await e7GithubLinked.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('warn');
    expect(r.fixRecommendation).toContain('GitHub');
  });
});
