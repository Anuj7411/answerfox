import { SchemaValidationError } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { extractTokens, renderContent } from './render.js';

describe('extractTokens', () => {
  it('returns the distinct token names in sorted order', () => {
    const content = 'Hello {{NAME}}, welcome to {{SITE}}. Sincerely, {{NAME}}.';
    expect(extractTokens(content)).toEqual(['NAME', 'SITE']);
  });

  it('returns an empty array when no tokens are present', () => {
    expect(extractTokens('Plain text with no placeholders')).toEqual([]);
  });

  it('ignores patterns that do not match the token shape', () => {
    // Lowercase, mixed case, single braces, and JSX object literals don't qualify.
    const content = '{{lowercase}} {{Mixed_Case}} {single} {{ NOT_A_TOKEN }} {{ unknown: foo }}';
    expect(extractTokens(content)).toEqual([]);
  });

  it('accepts token names with digits and underscores after the leading letter', () => {
    const content = '{{API_V2}} {{X}} {{LONG_NAME_WITH_UNDERSCORES}}';
    expect(extractTokens(content)).toEqual(['API_V2', 'LONG_NAME_WITH_UNDERSCORES', 'X']);
  });
});

describe('renderContent', () => {
  it('substitutes every token with its provided value', () => {
    const out = renderContent('Hello {{NAME}}, welcome to {{SITE}}.', {
      NAME: 'Anuj',
      SITE: 'Answerable',
    });
    expect(out).toBe('Hello Anuj, welcome to Answerable.');
  });

  it('substitutes repeated occurrences of the same token', () => {
    const out = renderContent('{{X}} and {{X}} and {{X}}', { X: 'yes' });
    expect(out).toBe('yes and yes and yes');
  });

  it('throws SchemaValidationError when a required token is missing', () => {
    try {
      renderContent('Hi {{NAME}} from {{SITE}}.', { NAME: 'Anuj' });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const msg = (e as SchemaValidationError).issues[0] ?? '';
      expect(msg).toContain('missing');
      expect(msg).toContain('SITE');
    }
  });

  it('throws SchemaValidationError when an unknown token key is provided', () => {
    try {
      renderContent('Hi {{NAME}}', { NAME: 'Anuj', EXTRA: 'oops' });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const msg = (e as SchemaValidationError).issues[0] ?? '';
      expect(msg).toContain('unknown');
      expect(msg).toContain('EXTRA');
    }
  });

  it('batches missing-token and unknown-token issues into a single error', () => {
    try {
      renderContent('Hi {{NAME}} from {{SITE}}.', { TYPO: 'value' });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const issues = (e as SchemaValidationError).issues;
      expect(issues).toHaveLength(2);
      expect(issues.some((i) => i.includes('missing'))).toBe(true);
      expect(issues.some((i) => i.includes('unknown'))).toBe(true);
    }
  });

  it('leaves no token-shaped placeholders behind after a successful render', () => {
    const content = '{{A}} {{B}} {{C}}';
    const out = renderContent(content, { A: '1', B: '2', C: '3' });
    expect(out).not.toMatch(/\{\{[A-Z][A-Z0-9_]*\}\}/);
  });

  it('preserves JSX-style {{ ... }} double-braces (not token-shaped)', () => {
    // JSX expressions like `style={{ color: 'red' }}` contain literal double
    // braces that must survive substitution — the inner expression is an
    // object literal, not a token.
    const content = 'style={{ color: someVar }} -- value: {{X}}';
    const out = renderContent(content, { X: '42' });
    expect(out).toBe('style={{ color: someVar }} -- value: 42');
  });

  it('renders an empty content string to an empty string', () => {
    expect(renderContent('', {})).toBe('');
  });
});
