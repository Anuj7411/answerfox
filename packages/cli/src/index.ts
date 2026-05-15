/**
 * @answerable/cli — the `answerable` command. Wraps the audit engine
 * for terminal and CI use.
 *
 * The default export is `createProgram()`, which returns a configured
 * commander instance. The `bin.ts` entrypoint invokes
 * `program.parseAsync(process.argv)`; tests call commands directly
 * (e.g. `runAuditCommand`, `runExplainCommand`) without going through
 * commander.
 */

import { Command } from 'commander';
import { registerAddCommand } from './commands/add.js';
import { registerAuditCommand } from './commands/audit.js';
import { registerExplainCommand } from './commands/explain.js';
import { registerInitCommand } from './commands/init.js';

export const VERSION = '0.0.0';

/**
 * Build the configured commander program. Separated from the bin
 * entry so tests can introspect the registered commands without
 * triggering process.exit.
 */
export function createProgram(): Command {
  const program = new Command();
  program
    .name('answerable')
    .description('The drop-in SEO toolkit that makes any site answerable by AI search engines.')
    .version(VERSION);
  registerInitCommand(program);
  registerAddCommand(program);
  registerAuditCommand(program);
  registerExplainCommand(program);
  return program;
}

export {
  registerAddCommand,
  runAddCommand,
  type AddCommandDeps,
  type AddCommandOptions,
  type AddCommandResult,
} from './commands/add.js';

export {
  registerAuditCommand,
  runAuditCommand,
  type AuditCommandDeps,
  type AuditCommandOptions,
  type AuditCommandResult,
} from './commands/audit.js';

export {
  registerExplainCommand,
  runExplainCommand,
  type ExplainCommandOptions,
  type ExplainCommandResult,
} from './commands/explain.js';

export {
  registerInitCommand,
  runInitCommand,
  type InitCommandDeps,
  type InitCommandOptions,
  type InitCommandResult,
} from './commands/init.js';

export {
  type Fs,
  InMemoryFs,
  NodeFs,
  dirname,
  joinPath,
} from './install/fs.js';

export {
  ClackPrompter,
  PromptCancelledError,
  ScriptedPrompter,
  type ConfirmPromptOptions,
  type Prompter,
  type TextPromptOptions,
} from './install/prompter.js';

export { detectNextProject, type NextProjectInfo } from './install/project.js';
