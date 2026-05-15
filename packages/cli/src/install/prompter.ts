import * as clack from '@clack/prompts';

export interface TextPromptOptions {
  readonly message: string;
  readonly defaultValue?: string;
  readonly validate?: (value: string) => string | undefined;
}

export interface ConfirmPromptOptions {
  readonly message: string;
  readonly defaultValue?: boolean;
}

/**
 * Interactive prompts abstracted behind a small interface so tests
 * can supply scripted answers without invoking @clack/prompts. The
 * production implementation (`ClackPrompter`) handles cancellation
 * by throwing — the CLI bin catches and exits with code 130 (SIGINT).
 */
export interface Prompter {
  text(opts: TextPromptOptions): Promise<string>;
  confirm(opts: ConfirmPromptOptions): Promise<boolean>;
  intro(message: string): void;
  outro(message: string): void;
  log(message: string): void;
}

export class PromptCancelledError extends Error {
  constructor() {
    super('Prompt cancelled by user');
    this.name = 'PromptCancelledError';
  }
}

export class ClackPrompter implements Prompter {
  async text(opts: TextPromptOptions): Promise<string> {
    const result = await clack.text({
      message: opts.message,
      ...(opts.defaultValue !== undefined && {
        placeholder: opts.defaultValue,
        defaultValue: opts.defaultValue,
      }),
      ...(opts.validate !== undefined && { validate: opts.validate }),
    });
    if (clack.isCancel(result)) {
      throw new PromptCancelledError();
    }
    return result;
  }

  async confirm(opts: ConfirmPromptOptions): Promise<boolean> {
    const result = await clack.confirm({
      message: opts.message,
      initialValue: opts.defaultValue ?? true,
    });
    if (clack.isCancel(result)) {
      throw new PromptCancelledError();
    }
    return result;
  }

  intro(message: string): void {
    clack.intro(message);
  }

  outro(message: string): void {
    clack.outro(message);
  }

  log(message: string): void {
    clack.log.message(message);
  }
}

/**
 * Test-only prompter that returns answers from a pre-recorded queue.
 * Throws if a prompt fires with no answer left, or if the answer type
 * doesn't match the prompt type (string for text, boolean for confirm) —
 * surfaces test-script drift loudly.
 */
export class ScriptedPrompter implements Prompter {
  private readonly answers: Array<string | boolean>;
  private cursor = 0;
  public readonly logs: string[] = [];

  constructor(answers: ReadonlyArray<string | boolean>) {
    this.answers = [...answers];
  }

  async text(opts: TextPromptOptions): Promise<string> {
    const next = this.answers[this.cursor++];
    if (next === undefined) {
      throw new Error(`ScriptedPrompter: ran out of answers at text prompt "${opts.message}"`);
    }
    if (typeof next !== 'string') {
      throw new Error(
        `ScriptedPrompter: expected string at text prompt "${opts.message}", got ${typeof next}`,
      );
    }
    return next;
  }

  async confirm(opts: ConfirmPromptOptions): Promise<boolean> {
    const next = this.answers[this.cursor++];
    if (next === undefined) {
      throw new Error(`ScriptedPrompter: ran out of answers at confirm prompt "${opts.message}"`);
    }
    if (typeof next !== 'boolean') {
      throw new Error(
        `ScriptedPrompter: expected boolean at confirm prompt "${opts.message}", got ${typeof next}`,
      );
    }
    return next;
  }

  intro(message: string): void {
    this.logs.push(`intro: ${message}`);
  }

  outro(message: string): void {
    this.logs.push(`outro: ${message}`);
  }

  log(message: string): void {
    this.logs.push(`log: ${message}`);
  }
}
