import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { e11LinkedinLinked } from './e11-linkedin-linked.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('E11 — LinkedIn linked', () => {
  it('passes on a linkedin.com company link', async () => {
    const r = await e11LinkedinLinked.run(
      inputFor(
        '<html><body><a href="https://linkedin.com/company/acme">LinkedIn</a></body></html>',
      ),
    );
    expect(r.status).toBe('pass');
  });

  it('passes on a personal LinkedIn /in/ profile', async () => {
    const r = await e11LinkedinLinked.run(
      inputFor('<html><body><a href="https://www.linkedin.com/in/jane">Jane</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('warns when no LinkedIn link exists', async () => {
    const r = await e11LinkedinLinked.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('warn');
    expect(r.fixRecommendation).toContain('LinkedIn');
  });
});
