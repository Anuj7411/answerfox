import { SchemaValidationError, parseAbsoluteUrl } from '@answerable/core';
import type { HowTo, HowToStep, HowToSupply, HowToTool } from 'schema-dts';
import type { Schema } from './_internal.js';

export interface HowToStepInput {
  readonly name: string;
  readonly text: string;
  /** Absolute URL to an illustrative image for this step. */
  readonly image?: string | undefined;
  /** Absolute URL anchored to this step (e.g. a video timestamp). */
  readonly url?: string | undefined;
}

export interface HowToInput {
  readonly name: string;
  readonly description?: string | undefined;
  /**
   * ISO 8601 duration string. Accepts the standard formats:
   * - Time-only: `"PT15M"`, `"PT1H30M"`, `"PT30S"`, `"PT2H"`
   * - Date-only: `"P1D"`, `"P2W"`, `"P1Y2M3D"`
   * - Date + time: `"P1DT2H"`, `"P1Y2DT3H30M"`
   *
   * Fractional seconds are allowed (`"PT30.5S"`).
   */
  readonly totalTime?: string | undefined;
  /** Absolute URL to a hero / cover image for the whole how-to. */
  readonly image?: string | undefined;
  /** Ordered list of steps. Must contain at least one entry. */
  readonly steps: readonly HowToStepInput[];
  /** Consumables needed (ingredients, materials). */
  readonly supply?: readonly string[] | undefined;
  /** Reusable tools needed (knives, hammers, software). */
  readonly tool?: readonly string[] | undefined;
}

/**
 * Strict ISO 8601 duration. Schema.org accepts both the "weeks alone"
 * form (`P2W`) and the "Y/M/D + T H/M/S" form, but not a mix of the two.
 */
const WEEK_ONLY = /^P(\d+)W$/;
const DATE_AND_TIME =
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

function isValidIso8601Duration(s: string): boolean {
  // Quick rejects.
  if (s.length < 3 || s.charAt(0) !== 'P') return false;

  // Weeks-only form (cannot combine with other components).
  if (WEEK_ONLY.test(s)) return true;

  const match = s.match(DATE_AND_TIME);
  if (!match) return false;

  // A bare "T" with no time components is invalid (e.g. "P1DT").
  if (s.includes('T') && !/T\d/.test(s)) return false;

  // At least one component (Y/M/D/H/M/S) must be present —
  // the regex itself would otherwise accept "P".
  return match.slice(1).some((g) => g !== undefined);
}

function validateHowToInput(input: HowToInput): void {
  const issues: string[] = [];
  if (input.name.trim() === '') {
    issues.push('name is empty');
  }
  if (input.steps.length === 0) {
    issues.push('steps must contain at least one step');
  }
  input.steps.forEach((step, i) => {
    if (step.name.trim() === '') {
      issues.push(`steps[${i}].name is empty`);
    }
    if (step.text.trim() === '') {
      issues.push(`steps[${i}].text is empty`);
    }
  });
  if (input.totalTime !== undefined && !isValidIso8601Duration(input.totalTime)) {
    issues.push(
      `totalTime is not a valid ISO 8601 duration (got "${input.totalTime}"). Expected formats like "PT15M", "PT1H30M", or "P1D".`,
    );
  }
  if (issues.length > 0) {
    throw new SchemaValidationError(issues);
  }
}

function buildStep(s: HowToStepInput, position: number): Exclude<HowToStep, string> {
  const out: Exclude<HowToStep, string> = {
    '@type': 'HowToStep',
    position,
    name: s.name,
    text: s.text,
  };
  if (s.image !== undefined) {
    out.image = parseAbsoluteUrl(s.image);
  }
  if (s.url !== undefined) {
    out.url = parseAbsoluteUrl(s.url);
  }
  return out;
}

function buildSupply(name: string): Exclude<HowToSupply, string> {
  return { '@type': 'HowToSupply', name };
}

function buildTool(name: string): Exclude<HowToTool, string> {
  return { '@type': 'HowToTool', name };
}

/**
 * Generate a fully-typed JSON-LD `HowTo` object. Drives audit
 * check **C8**.
 *
 * Steps are auto-numbered via the `position` field starting at 1 —
 * callers don't supply positions themselves.
 *
 * @throws SchemaValidationError batching every issue across the
 *   top-level fields and every step.
 * @throws InvalidUrlError for the first malformed URL encountered
 *   (`image`, any `steps[*].image`, any `steps[*].url`).
 */
export function howTo(input: HowToInput): Schema<HowTo> {
  validateHowToInput(input);

  const out: Schema<HowTo> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    step: input.steps.map((s, i) => buildStep(s, i + 1)),
  };

  if (input.description !== undefined) {
    out.description = input.description;
  }
  if (input.totalTime !== undefined) {
    out.totalTime = input.totalTime;
  }
  if (input.image !== undefined) {
    out.image = parseAbsoluteUrl(input.image);
  }
  if (input.supply !== undefined && input.supply.length > 0) {
    out.supply = input.supply.map(buildSupply);
  }
  if (input.tool !== undefined && input.tool.length > 0) {
    out.tool = input.tool.map(buildTool);
  }

  return out;
}
