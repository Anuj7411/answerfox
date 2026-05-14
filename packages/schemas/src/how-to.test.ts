import { InvalidUrlError, SchemaValidationError } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { howTo } from './how-to.js';

const MINIMAL = {
  name: 'How to make tea',
  steps: [
    { name: 'Boil water', text: 'Heat 1 cup of water to 95C.' },
    { name: 'Steep', text: 'Add tea bag and wait 3 minutes.' },
  ],
} as const;

describe('howTo', () => {
  it('emits a well-formed HowTo with auto-numbered step positions', () => {
    const out = howTo(MINIMAL);
    expect(out['@context']).toBe('https://schema.org');
    expect(out['@type']).toBe('HowTo');
    expect(out.name).toBe('How to make tea');
    expect(out.step).toEqual([
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Boil water',
        text: 'Heat 1 cup of water to 95C.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Steep',
        text: 'Add tea bag and wait 3 minutes.',
      },
    ]);
  });

  it('includes optional description, totalTime, and image when supplied', () => {
    const out = howTo({
      ...MINIMAL,
      description: 'A simple cup of black tea.',
      totalTime: 'PT5M',
      image: 'https://example.com/tea.jpg',
    });
    expect(out.description).toBe('A simple cup of black tea.');
    expect(out.totalTime).toBe('PT5M');
    expect(out.image).toBe('https://example.com/tea.jpg');
  });

  it('omits description, totalTime, image, supply, and tool when not supplied', () => {
    const out = howTo(MINIMAL);
    for (const field of ['description', 'totalTime', 'image', 'supply', 'tool']) {
      expect(field in out).toBe(false);
    }
  });

  it('emits step image and url URLs when supplied', () => {
    const out = howTo({
      name: 'Demo',
      steps: [
        {
          name: 'Step 1',
          text: 'Watch the video.',
          image: 'https://example.com/step1.jpg',
          url: 'https://example.com/video#t=42',
        },
      ],
    });
    expect(out.step).toEqual([
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Step 1',
        text: 'Watch the video.',
        image: 'https://example.com/step1.jpg',
        url: 'https://example.com/video#t=42',
      },
    ]);
  });

  it('builds HowToSupply nested objects from string list', () => {
    const out = howTo({ ...MINIMAL, supply: ['tea bag', 'water', 'sugar'] });
    expect(out.supply).toEqual([
      { '@type': 'HowToSupply', name: 'tea bag' },
      { '@type': 'HowToSupply', name: 'water' },
      { '@type': 'HowToSupply', name: 'sugar' },
    ]);
  });

  it('builds HowToTool nested objects from string list', () => {
    const out = howTo({ ...MINIMAL, tool: ['kettle', 'mug'] });
    expect(out.tool).toEqual([
      { '@type': 'HowToTool', name: 'kettle' },
      { '@type': 'HowToTool', name: 'mug' },
    ]);
  });

  it('omits supply and tool when arrays are empty', () => {
    const out = howTo({ ...MINIMAL, supply: [], tool: [] });
    expect('supply' in out).toBe(false);
    expect('tool' in out).toBe(false);
  });

  it('accepts a wide range of valid ISO 8601 duration formats', () => {
    for (const dur of [
      'PT15M',
      'PT1H30M',
      'PT2H',
      'PT30S',
      'PT30.5S',
      'PT1H30M45S',
      'P1D',
      'P2W',
      'P1Y2M3D',
      'P1DT2H',
      'P1Y2DT3H30M',
    ]) {
      expect(() => howTo({ ...MINIMAL, totalTime: dur })).not.toThrow();
    }
  });

  it('rejects malformed durations', () => {
    for (const bad of [
      '15M', // missing P
      'P', // empty (no components)
      'PT', // T with no time component
      'P1DT', // trailing T with no time
      '1H', // missing P
      'P1H', // H without preceding T (H is a time-side unit)
      'PT1Y', // Y is a date-side unit, not allowed after T
      'PnYnD', // letters where digits expected
    ]) {
      expect(() => howTo({ ...MINIMAL, totalTime: bad })).toThrow(SchemaValidationError);
    }
  });

  it('throws SchemaValidationError with a helpful message on bad totalTime', () => {
    try {
      howTo({ ...MINIMAL, totalTime: 'tomorrow' });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const msg = (e as SchemaValidationError).issues[0] ?? '';
      expect(msg).toContain('totalTime');
      expect(msg).toContain('tomorrow');
      expect(msg).toContain('PT15M');
    }
  });

  it('throws SchemaValidationError on empty steps array', () => {
    try {
      howTo({ name: 'Demo', steps: [] });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect((e as SchemaValidationError).issues[0]).toContain('at least one step');
    }
  });

  it('throws SchemaValidationError on empty top-level name', () => {
    expect(() => howTo({ name: '   ', steps: [{ name: 'X', text: 'Y' }] })).toThrow(
      SchemaValidationError,
    );
  });

  it('throws SchemaValidationError on empty step name or text', () => {
    try {
      howTo({
        name: 'Demo',
        steps: [
          { name: '', text: 'has text' },
          { name: 'has name', text: '' },
        ],
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const issues = (e as SchemaValidationError).issues;
      expect(issues.some((i) => i.includes('steps[0].name'))).toBe(true);
      expect(issues.some((i) => i.includes('steps[1].text'))).toBe(true);
    }
  });

  it('batches every issue across top-level, steps, and totalTime', () => {
    try {
      howTo({
        name: '',
        totalTime: 'bad',
        steps: [
          { name: '', text: '' },
          { name: 'ok', text: 'ok' },
        ],
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const issues = (e as SchemaValidationError).issues;
      // name, steps[0].name, steps[0].text, totalTime
      expect(issues.length).toBeGreaterThanOrEqual(4);
      expect(issues.some((i) => i.includes('name is empty'))).toBe(true);
      expect(issues.some((i) => i.includes('steps[0].name'))).toBe(true);
      expect(issues.some((i) => i.includes('steps[0].text'))).toBe(true);
      expect(issues.some((i) => i.includes('totalTime'))).toBe(true);
    }
  });

  it('throws InvalidUrlError on a bad top-level image URL', () => {
    expect(() => howTo({ ...MINIMAL, image: 'not a url' })).toThrow(InvalidUrlError);
  });

  it('throws InvalidUrlError on a bad step image URL', () => {
    expect(() =>
      howTo({
        name: 'Demo',
        steps: [{ name: 'Step', text: 'Text', image: 'not a url' }],
      }),
    ).toThrow(InvalidUrlError);
  });

  it('throws InvalidUrlError on a bad step url', () => {
    expect(() =>
      howTo({
        name: 'Demo',
        steps: [{ name: 'Step', text: 'Text', url: 'ftp://example.com' }],
      }),
    ).toThrow(InvalidUrlError);
  });
});
