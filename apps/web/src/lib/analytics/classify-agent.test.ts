import { describe, expect, it } from 'vitest';
import { classifyAgent } from './classify-agent';

describe('classifyAgent', () => {
  describe('AI surface UAs', () => {
    it('catches ChatGPT crawler (gptbot)', () => {
      expect(
        classifyAgent({
          userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)',
        }),
      ).toBe('chatgpt');
    });

    it('catches ChatGPT user fetch (ChatGPT-User)', () => {
      expect(classifyAgent({ userAgent: 'Mozilla/5.0 ... ChatGPT-User/1.0' })).toBe('chatgpt');
    });

    it('catches OAI-SearchBot', () => {
      expect(classifyAgent({ userAgent: 'OAI-SearchBot/1.0' })).toBe('chatgpt');
    });

    it('catches PerplexityBot', () => {
      expect(
        classifyAgent({
          userAgent:
            'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
        }),
      ).toBe('perplexity');
    });

    it('catches Perplexity-User', () => {
      expect(classifyAgent({ userAgent: 'Mozilla/5.0 Perplexity-User/1.0' })).toBe('perplexity');
    });

    it('catches Google-Extended (Gemini training)', () => {
      expect(classifyAgent({ userAgent: 'Google-Extended' })).toBe('gemini');
    });

    it('catches GoogleOther (Gemini grounding)', () => {
      expect(classifyAgent({ userAgent: 'Mozilla/5.0 (compatible; GoogleOther)' })).toBe('gemini');
    });

    it('catches ClaudeBot crawler', () => {
      expect(classifyAgent({ userAgent: 'Mozilla/5.0 (compatible; ClaudeBot/1.0)' })).toBe(
        'claude',
      );
    });

    it('catches Claude-Web fetch', () => {
      expect(classifyAgent({ userAgent: 'Mozilla/5.0 Claude-Web/1.0' })).toBe('claude');
    });

    it('catches anthropic-ai legacy UA', () => {
      expect(classifyAgent({ userAgent: 'anthropic-ai/1.0' })).toBe('claude');
    });
  });

  describe('referrer click-through', () => {
    const HUMAN_UA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';

    it('counts chatgpt.com click as ChatGPT visit', () => {
      expect(
        classifyAgent({ userAgent: HUMAN_UA, referrer: 'https://chatgpt.com/share/abc' }),
      ).toBe('chatgpt');
    });

    it('counts chat.openai.com legacy referrer as ChatGPT', () => {
      expect(classifyAgent({ userAgent: HUMAN_UA, referrer: 'https://chat.openai.com/' })).toBe(
        'chatgpt',
      );
    });

    it('counts perplexity.ai click as Perplexity visit', () => {
      expect(
        classifyAgent({ userAgent: HUMAN_UA, referrer: 'https://www.perplexity.ai/search?q=x' }),
      ).toBe('perplexity');
    });

    it('counts gemini.google.com click as Gemini visit', () => {
      expect(
        classifyAgent({ userAgent: HUMAN_UA, referrer: 'https://gemini.google.com/app' }),
      ).toBe('gemini');
    });

    it('counts claude.ai click as Claude visit', () => {
      expect(classifyAgent({ userAgent: HUMAN_UA, referrer: 'https://claude.ai/chat/123' })).toBe(
        'claude',
      );
    });

    it('referrer with no AI host falls through to human', () => {
      expect(
        classifyAgent({ userAgent: HUMAN_UA, referrer: 'https://news.ycombinator.com/' }),
      ).toBe('human');
    });

    it('null referrer + human UA stays human', () => {
      expect(classifyAgent({ userAgent: HUMAN_UA, referrer: null })).toBe('human');
    });
  });

  describe('catch-alls', () => {
    it('generic bot UA buckets to other-bot', () => {
      expect(classifyAgent({ userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)' })).toBe(
        'other-bot',
      );
    });

    it('headless chrome buckets to other-bot', () => {
      expect(classifyAgent({ userAgent: 'Mozilla/5.0 HeadlessChrome/123.0' })).toBe('other-bot');
    });

    it('generic crawler buckets to other-bot', () => {
      expect(classifyAgent({ userAgent: 'AcmeCrawler/0.1' })).toBe('other-bot');
    });

    it('plain browser UA stays human', () => {
      expect(
        classifyAgent({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        }),
      ).toBe('human');
    });

    it('UA wins over referrer when both signal', () => {
      // A real ChatGPT crawler that happens to send a perplexity referrer is
      // still a ChatGPT crawler.
      expect(classifyAgent({ userAgent: 'GPTBot/1.0', referrer: 'https://perplexity.ai/' })).toBe(
        'chatgpt',
      );
    });
  });
});
