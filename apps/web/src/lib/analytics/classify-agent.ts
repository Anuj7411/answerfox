export type AgentLabel = 'chatgpt' | 'perplexity' | 'gemini' | 'claude' | 'other-bot' | 'human';

/**
 * Classify a request by its User-Agent and Referer headers.
 *
 * UA-first because the four AI surfaces we care about all identify
 * themselves in the UA string when they crawl. Referer is a secondary
 * signal for click-through traffic (a human clicked a Perplexity
 * citation and landed on the site).
 *
 * The list is curated, not exhaustive — adding new signatures is a
 * one-line PR, and the test suite documents what each rule covers.
 * Anything unrecognised falls through to 'other-bot' for known bot
 * shapes and 'human' otherwise.
 */
export function classifyAgent({
  userAgent,
  referrer,
}: {
  userAgent: string;
  referrer?: string | null;
}): AgentLabel {
  const ua = userAgent.toLowerCase();

  // 1) AI-surface user agents — these crawl your pages to ground answers.
  if (ua.includes('chatgpt-user') || ua.includes('gptbot') || ua.includes('oai-searchbot')) {
    return 'chatgpt';
  }
  if (ua.includes('perplexitybot') || ua.includes('perplexity-user')) {
    return 'perplexity';
  }
  if (ua.includes('google-extended') || ua.includes('googleother')) {
    return 'gemini';
  }
  if (ua.includes('claude-web') || ua.includes('claudebot') || ua.includes('anthropic-ai')) {
    return 'claude';
  }

  // 2) Click-through traffic from AI answer pages. UA is human-shaped,
  //    referrer tells the truth.
  const ref = (referrer ?? '').toLowerCase();
  if (ref.length > 0) {
    if (ref.includes('chat.openai.com') || ref.includes('chatgpt.com')) return 'chatgpt';
    if (ref.includes('perplexity.ai')) return 'perplexity';
    if (ref.includes('gemini.google.com') || ref.includes('bard.google.com')) return 'gemini';
    if (ref.includes('claude.ai')) return 'claude';
  }

  // 3) Known catch-all bot signatures.
  if (
    ua.includes('bot') ||
    ua.includes('crawler') ||
    ua.includes('spider') ||
    ua.includes('headless')
  ) {
    return 'other-bot';
  }

  return 'human';
}
