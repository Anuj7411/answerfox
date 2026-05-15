import { describe, expect, it } from 'vitest';
import { ScriptedPrompter } from './prompter.js';

describe('ScriptedPrompter', () => {
  it('returns the next text answer in order', async () => {
    const p = new ScriptedPrompter(['Acme', 'acme.com']);
    expect(await p.text({ message: 'Name?' })).toBe('Acme');
    expect(await p.text({ message: 'Domain?' })).toBe('acme.com');
  });

  it('returns confirm answers and walks the cursor', async () => {
    const p = new ScriptedPrompter(['Acme', true, false]);
    await p.text({ message: 'Name?' });
    expect(await p.confirm({ message: 'Yes?' })).toBe(true);
    expect(await p.confirm({ message: 'No?' })).toBe(false);
  });

  it('throws if a prompt fires after the queue runs out', async () => {
    const p = new ScriptedPrompter([]);
    await expect(p.text({ message: 'Hi?' })).rejects.toThrow(/ran out of answers/);
  });

  it('throws if a text prompt receives a boolean answer', async () => {
    const p = new ScriptedPrompter([true]);
    await expect(p.text({ message: 'Name?' })).rejects.toThrow(/expected string/);
  });

  it('throws if a confirm prompt receives a string answer', async () => {
    const p = new ScriptedPrompter(['nope']);
    await expect(p.confirm({ message: 'Yes?' })).rejects.toThrow(/expected boolean/);
  });

  it('captures intro/outro/log messages into the logs array in call order', () => {
    const p = new ScriptedPrompter([]);
    p.intro('start');
    p.outro('end');
    p.log('middle');
    expect(p.logs).toEqual(['intro: start', 'outro: end', 'log: middle']);
  });
});
