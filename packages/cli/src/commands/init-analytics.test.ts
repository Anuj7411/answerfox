import { describe, expect, it } from 'vitest';
import { runInitAnalyticsCommand } from './init-analytics.js';

const VALID_SITE_ID = '11111111-2222-3333-4444-555555555555';

describe('runInitAnalyticsCommand', () => {
  describe('argument validation', () => {
    it('exits 2 when siteId is empty', () => {
      const res = runInitAnalyticsCommand({ siteId: '' });
      expect(res.exitCode).toBe(2);
      expect(res.error).toContain('--site-id');
    });

    it('exits 2 when siteId is only whitespace', () => {
      const res = runInitAnalyticsCommand({ siteId: '   ' });
      expect(res.exitCode).toBe(2);
    });

    it('exits 2 when siteId is not a UUID', () => {
      const res = runInitAnalyticsCommand({ siteId: 'not-a-uuid' });
      expect(res.exitCode).toBe(2);
      expect(res.error).toContain('Invalid');
    });

    it('exits 2 when framework is unsupported', () => {
      const res = runInitAnalyticsCommand({ siteId: VALID_SITE_ID, framework: 'remix' });
      expect(res.exitCode).toBe(2);
      expect(res.error).toContain('Unsupported');
      expect(res.error).toContain('next');
    });

    it('accepts a valid UUID even with surrounding whitespace', () => {
      const res = runInitAnalyticsCommand({ siteId: `  ${VALID_SITE_ID}  ` });
      expect(res.exitCode).toBe(0);
    });
  });

  describe('Next.js output', () => {
    it('emits valid-looking middleware code', () => {
      const res = runInitAnalyticsCommand({ siteId: VALID_SITE_ID });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain("import { NextResponse } from 'next/server'");
      expect(res.stdout).toContain("import type { NextRequest } from 'next/server'");
      expect(res.stdout).toContain('export function middleware');
      expect(res.stdout).toContain('export const config');
      expect(res.stdout).toContain('matcher');
    });

    it('embeds the siteId verbatim', () => {
      const res = runInitAnalyticsCommand({ siteId: VALID_SITE_ID });
      expect(res.stdout).toContain(VALID_SITE_ID);
    });

    it('never embeds a literal token in the code', () => {
      const res = runInitAnalyticsCommand({ siteId: VALID_SITE_ID });
      // Token comes from env at runtime. Generated code reads
      // process.env.ANSWERFOX_INGEST_TOKEN.
      expect(res.stdout).toContain('ANSWERFOX_INGEST_TOKEN');
      expect(res.stdout).not.toMatch(/Bearer afi_/);
    });

    it('defaults to https://app.answerfox.dev when no app-url passed', () => {
      const res = runInitAnalyticsCommand({ siteId: VALID_SITE_ID });
      expect(res.stdout).toContain('https://app.answerfox.dev/api/track/visit');
    });

    it('honours an explicit --app-url', () => {
      const res = runInitAnalyticsCommand({
        siteId: VALID_SITE_ID,
        appUrl: 'http://localhost:3000',
      });
      expect(res.stdout).toContain('http://localhost:3000/api/track/visit');
    });

    it('strips trailing slashes from --app-url', () => {
      const res = runInitAnalyticsCommand({
        siteId: VALID_SITE_ID,
        appUrl: 'https://app.answerfox.dev/',
      });
      expect(res.stdout).toContain('https://app.answerfox.dev/api/track/visit');
      expect(res.stdout).not.toContain('https://app.answerfox.dev//api');
    });

    it('explicitly targets framework=next when passed', () => {
      const res = runInitAnalyticsCommand({ siteId: VALID_SITE_ID, framework: 'next' });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('NextRequest');
    });
  });
});
