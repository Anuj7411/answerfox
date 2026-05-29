import { describe, expect, it } from 'vitest';
import { runExplainCommand } from './explain.js';

describe('runExplainCommand', () => {
  it('returns exit 0 with full documentation for a known check', () => {
    const result = runExplainCommand('A4', { color: false });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('A4');
    expect(result.stdout).toContain('Canonical');
    expect(result.stdout).toContain('Category:');
    expect(result.stdout).toContain('meta-and-technical');
    expect(result.stdout).toContain('Severity:');
    expect(result.stdout).toContain('critical');
    expect(result.stdout).toContain('Docs:');
    expect(result.stdout).toContain('https://answerfox.dev/docs/checks/A4');
  });

  it('is case-insensitive (lowercase id matches uppercase)', () => {
    const result = runExplainCommand('a4', { color: false });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('A4');
  });

  it('returns exit 2 and lists available IDs on unknown check', () => {
    const result = runExplainCommand('Z99', { color: false });
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('Z99');
    expect(result.error).toContain('A1');
    expect(result.error).toContain('C1');
  });

  it('pluralises "points" correctly for single-point checks', () => {
    // A7 (charset) is a 1-point check.
    const a7 = runExplainCommand('A7', { color: false });
    expect(a7.stdout).toContain('1 point');
    expect(a7.stdout).not.toContain('1 points');
  });

  it('pluralises "points" correctly for multi-point checks', () => {
    // A1 (title) is a 3-point check.
    const a1 = runExplainCommand('A1', { color: false });
    expect(a1.stdout).toContain('3 points');
  });

  it('emits the rationale block', () => {
    const result = runExplainCommand('A1', { color: false });
    // A1's rationale mentions SERPs.
    expect(result.stdout).toContain('SERP');
  });
});
