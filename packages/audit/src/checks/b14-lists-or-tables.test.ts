import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { b14ListsOrTables } from './b14-lists-or-tables.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('B14 — lists or tables', () => {
  it('passes when the page has a <ul>', async () => {
    const r = await b14ListsOrTables.run(inputFor('<html><body><ul><li>x</li></ul></body></html>'));
    expect(r.status).toBe('pass');
  });

  it('passes when the page has an <ol>', async () => {
    const r = await b14ListsOrTables.run(inputFor('<html><body><ol><li>x</li></ol></body></html>'));
    expect(r.status).toBe('pass');
  });

  it('passes when the page has a <table>', async () => {
    const r = await b14ListsOrTables.run(
      inputFor('<html><body><table><tr><td>x</td></tr></table></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('warns when none are present', async () => {
    const r = await b14ListsOrTables.run(inputFor('<html><body><p>just prose</p></body></html>'));
    expect(r.status).toBe('warn');
    expect(r.fixRecommendation).toContain('ul');
  });
});
