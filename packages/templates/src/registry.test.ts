import { describe, expect, it } from 'vitest';
import { getTemplate, isManifestTemplate, listTemplates, renderTemplate } from './registry.js';
import { extractTokens } from './render.js';
import type { Template, TemplateName } from './types.js';

const PAGE_NAMES: readonly TemplateName[] = ['about', 'privacy', 'terms', 'faq', 'contact'];
const MANIFEST_NAMES: readonly TemplateName[] = [
  'agent-card',
  'mcp-server-card',
  'api-catalog',
  'agent-permissions',
  'oauth-discovery',
];
const EXPECTED_NAMES: readonly TemplateName[] = [...PAGE_NAMES, ...MANIFEST_NAMES];

const SAMPLE_VALUES: Readonly<Record<string, string>> = {
  PROJECT_NAME: 'Acme',
  DOMAIN: 'acme.com',
  URL: 'https://acme.com',
  DESCRIPTION: 'The friendliest widget shop on the internet.',
  CONTACT_EMAIL: 'hello@acme.com',
  EFFECTIVE_DATE: '2026-05-15',
  JURISDICTION: 'the State of Delaware, USA',
};

describe('listTemplates', () => {
  it('returns every Phase 1 template once', () => {
    const names = listTemplates().map((t) => t.name);
    expect(names).toEqual(EXPECTED_NAMES);
  });

  it('returns entries with unique names', () => {
    const names = listTemplates().map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('returns entries with distinct filenames', () => {
    const filenames = listTemplates().map((t) => t.filename);
    expect(new Set(filenames).size).toBe(filenames.length);
  });
});

describe('getTemplate', () => {
  it('returns the same object across calls (safe to compare by reference)', () => {
    expect(getTemplate('about')).toBe(getTemplate('about'));
    expect(getTemplate('agent-card')).toBe(getTemplate('agent-card'));
  });

  for (const name of EXPECTED_NAMES) {
    it(`returns a Template whose name matches the lookup key for "${name}"`, () => {
      expect(getTemplate(name).name).toBe(name);
    });
  }
});

describe('isManifestTemplate', () => {
  it('returns true for every manifest template', () => {
    for (const name of MANIFEST_NAMES) {
      expect(isManifestTemplate(name)).toBe(true);
    }
  });

  it('returns false for every page template', () => {
    for (const name of PAGE_NAMES) {
      expect(isManifestTemplate(name)).toBe(false);
    }
  });
});

describe('page template invariants', () => {
  for (const name of PAGE_NAMES) {
    const template = getTemplate(name);
    describe(template.name, () => {
      it('has a filename inside the app/ directory ending with /page.tsx', () => {
        expect(template.filename.startsWith('app/')).toBe(true);
        expect(template.filename.endsWith('/page.tsx')).toBe(true);
      });

      it('imports defineSeo from @answerfox/metadata', () => {
        expect(template.content).toContain("from '@answerfox/metadata'");
        expect(template.content).toContain('defineSeo');
      });

      it('exports a default React component', () => {
        expect(template.content).toMatch(/export default function \w+Page\(/);
      });

      it('declared requiredTokens match what extractTokens(content) derives', () => {
        const derived = extractTokens(template.content);
        const declared = [...template.requiredTokens].sort();
        expect(declared).toEqual([...derived]);
      });
    });
  }
});

describe('manifest template invariants', () => {
  for (const name of MANIFEST_NAMES) {
    const template = getTemplate(name);
    describe(template.name, () => {
      it('has a filename inside public/.well-known/', () => {
        expect(template.filename.startsWith('public/.well-known/')).toBe(true);
      });

      it('has no required tokens (manifests are static in v0.3.1)', () => {
        expect(template.requiredTokens).toEqual([]);
      });

      it('has non-empty content', () => {
        expect(template.content.length).toBeGreaterThan(0);
      });

      it('contains a TODO placeholder OR is a static policy file', () => {
        // agent-permissions is a complete policy (no TODOs needed).
        // All others should have at least one TODO marker so the user
        // knows what to edit.
        if (template.name === 'agent-permissions') {
          expect(template.content).toContain('"allow"');
        } else {
          expect(template.content).toContain('TODO');
        }
      });
    });
  }
});

describe('renderTemplate', () => {
  for (const name of PAGE_NAMES) {
    const template = getTemplate(name);
    it(`renders "${template.name}" with sample values and leaves no token placeholders`, () => {
      const valuesForTemplate = pickRequired(template, SAMPLE_VALUES);
      const out = renderTemplate(template.name, valuesForTemplate);
      expect(out).not.toMatch(/\{\{[A-Z][A-Z0-9_]*\}\}/);
      expect(out.length).toBeGreaterThan(0);
    });
  }

  for (const name of MANIFEST_NAMES) {
    const template = getTemplate(name);
    it(`renders "${template.name}" with empty values (manifests have no tokens)`, () => {
      const out = renderTemplate(template.name, {});
      expect(out).toBe(template.content);
    });
  }

  it('renders about with the project name appearing in the rendered output', () => {
    const out = renderTemplate('about', pickRequired(getTemplate('about'), SAMPLE_VALUES));
    expect(out).toContain('About Acme');
    expect(out).toContain('https://acme.com/about');
  });

  it('renders faq with the FAQPage JSON-LD generator call wired up', () => {
    const out = renderTemplate('faq', pickRequired(getTemplate('faq'), SAMPLE_VALUES));
    expect(out).toContain("import { faqPage } from '@answerfox/schemas'");
    expect(out).toContain('What is Acme?');
  });

  it('renders about with the Organization JSON-LD generator call wired up', () => {
    const out = renderTemplate('about', pickRequired(getTemplate('about'), SAMPLE_VALUES));
    expect(out).toContain("import { organization } from '@answerfox/schemas'");
  });
});

/**
 * Pick only the keys this template declares as required from a sample
 * values bag. Mirrors what the CLI will do once it has prompted the
 * user for every distinct token across the install set.
 */
function pickRequired(
  template: Template,
  bag: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const key of template.requiredTokens) {
    const value = bag[key];
    if (value === undefined) {
      throw new Error(`Test bug: sample bag has no value for required token "${key}"`);
    }
    out[key] = value;
  }
  return out;
}
