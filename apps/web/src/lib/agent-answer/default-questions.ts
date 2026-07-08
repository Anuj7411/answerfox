/**
 * The default developer-question set. These are the questions a real
 * developer asks an AI coding agent when evaluating or adopting a
 * library — the moments where a bad answer sends them to a competitor.
 *
 * Kept deliberately generic so they apply to any devtool/library docs
 * without per-site configuration (opinionated-defaults, not a config
 * engine). Callers can override with library-specific questions when
 * they have them.
 */
export const DEFAULT_DEVELOPER_QUESTIONS: readonly string[] = [
  'How do I install this library and what is the minimal setup to get started?',
  'Show me a complete working code example for the most common use case.',
  'How do I authenticate or configure credentials for this library?',
  'What are the main API methods or exports, and what does each do?',
  'How do I handle errors and what do the common error cases look like?',
];
