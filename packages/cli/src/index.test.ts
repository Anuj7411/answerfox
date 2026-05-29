import { describe, expect, it } from 'vitest';
import { createProgram } from './index.js';

describe('createProgram', () => {
  it('registers the audit and explain subcommands', () => {
    const program = createProgram();
    const names = program.commands.map((c) => c.name());
    expect(names).toContain('audit');
    expect(names).toContain('explain');
  });

  it('uses "answerfox" as the program name', () => {
    const program = createProgram();
    expect(program.name()).toBe('answerfox');
  });

  it('exposes a description and a version', () => {
    const program = createProgram();
    expect(program.description().length).toBeGreaterThan(0);
    expect(program.version()).toBeTruthy();
  });
});
