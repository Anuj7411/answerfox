import type { Metadata } from 'next';
import { LANDING_HTML } from './landing-html';
import { LandingScripts } from './landing-scripts';
import './landing.css';

export const metadata: Metadata = {
  title: 'Answerfox — AI is reading the blank version of your docs',
  description:
    "GPTBot, ClaudeBot and PerplexityBot don't run JavaScript, so your docs reach them gutted. See exactly what AI crawlers receive, then merge the fix as a pull request.",
};

/**
 * Marketing landing, ported verbatim from the delivered answerfox-landing.html
 * design. The markup lives in landing-html.ts (copied 1:1, CTA hrefs wired),
 * the styles in landing.css, and the interactions in landing-scripts.tsx.
 *
 * The inline script adds `.js` to <html> before paint so the reveal
 * animations start hidden (no flash), matching the design's own bootstrap.
 * The HTML is a static first-party string, so dangerouslySetInnerHTML is safe.
 */
export default function LandingPage() {
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static first-party bootstrap, no user input
        dangerouslySetInnerHTML={{
          __html: "try{document.documentElement.classList.add('js')}catch(e){}",
        }}
      />
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static first-party design markup, no user input
        dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
      />
      <LandingScripts />
    </>
  );
}
