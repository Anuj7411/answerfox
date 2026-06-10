import { describe, expect, it } from 'vitest';
import { detectGatePage, formatGateBanner } from './gate-detector.js';
import { loadHtml } from './parser.js';

describe('detectGatePage', () => {
  it('classifies a classic login wall as a gate page', () => {
    // Mirrors what linkedin.com / github.com look like to a logged-out
    // visitor: short title, login keyword, password input, almost no
    // body copy, no trust nav.
    const html = `
      <html>
        <head><title>LinkedIn: Log In or Sign Up</title></head>
        <body>
          <form>
            <input type="email" name="email"/>
            <input type="password" name="password"/>
            <button>Sign in</button>
          </form>
        </body>
      </html>
    `;
    const result = detectGatePage(loadHtml(html));
    expect(result.isGate).toBe(true);
    expect(result.signals).toContain('short-title');
    expect(result.signals).toContain('login-keyword-in-title');
    expect(result.signals).toContain('password-input-present');
    expect(result.signals).toContain('low-word-count');
    expect(result.signals).toContain('no-trust-nav-links');
  });

  it('does NOT classify a content marketing page as a gate', () => {
    // Stripe / Vercel-shaped: long title, rich body copy, navigation
    // links to /about and /pricing, no password input.
    const html = `
      <html>
        <head><title>Stripe — Financial infrastructure for the internet</title></head>
        <body>
          <nav>
            <a href="/about">About</a>
            <a href="/pricing">Pricing</a>
            <a href="/docs">Docs</a>
          </nav>
          <main>
            <h1>Build the future of online commerce</h1>
            <p>
              Stripe is a suite of APIs powering online payment processing
              and commerce solutions for internet businesses of all sizes.
              Accelerate your business with a single integration. We handle
              the complexity of global payments so you can focus on
              building your product. Trusted by millions of businesses
              worldwide. From startups to large enterprises, our flexible
              platform scales with you. Use our APIs to build subscription
              billing, on-demand marketplaces, fraud prevention, and more.
            </p>
            <p>
              Our developer-friendly tools and documentation make it easy
              to get started. Whether you need to accept one-time payments
              or build a multi-sided platform, Stripe has the building
              blocks you need. Join thousands of companies using our
              infrastructure.
            </p>
          </main>
        </body>
      </html>
    `;
    const result = detectGatePage(loadHtml(html));
    expect(result.isGate).toBe(false);
  });

  it('does NOT classify a docs page as a gate', () => {
    const html = `
      <html>
        <head><title>Getting started with the Stripe API documentation</title></head>
        <body>
          <nav>
            <a href="/docs">Docs</a>
            <a href="/blog">Blog</a>
          </nav>
          <article>
            <h1>Quickstart</h1>
            <p>
              Welcome to the Stripe API reference. To get started, install
              the Stripe SDK for your language. We support Node.js, Python,
              Ruby, Go, Java, PHP, and .NET. Generate an API key from your
              dashboard. Make your first request using curl or the SDK.
              The API uses standard HTTPS with bearer token authentication.
              All requests are scoped to your account and rate-limited to
              prevent abuse. Read the authentication guide for details on
              keys, scopes, and Connect platform accounts. Examples in this
              guide cover charges, customers, subscriptions, and webhooks.
            </p>
          </article>
        </body>
      </html>
    `;
    const result = detectGatePage(loadHtml(html));
    expect(result.isGate).toBe(false);
  });

  it('classifies as gate when threshold-1 signals fire on a thin page', () => {
    // Three signals: short title, login keyword, no trust nav. No
    // password input. No body content. That's 4 of 5 signals, which
    // exceeds the threshold of 3.
    const html = `
      <html>
        <head><title>Sign in</title></head>
        <body><div>Loading...</div></body>
      </html>
    `;
    const result = detectGatePage(loadHtml(html));
    expect(result.isGate).toBe(true);
  });

  it('returns isGate=false but lists matching signals when below threshold', () => {
    // Short title and no trust nav (2 of 5 signals). Body is long enough
    // that low-word-count does NOT fire, keeping us under the 3-signal
    // gate threshold.
    const longBody = Array.from({ length: 10 })
      .map(
        () =>
          'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum.',
      )
      .join(' ');
    const html = `
      <html>
        <head><title>Hi</title></head>
        <body>
          <main>
            <h1>This is a small landing page</h1>
            <p>${longBody}</p>
          </main>
        </body>
      </html>
    `;
    const result = detectGatePage(loadHtml(html));
    expect(result.isGate).toBe(false);
    expect(result.signals).toContain('short-title');
    expect(result.signals).toContain('no-trust-nav-links');
    expect(result.signals).not.toContain('low-word-count');
  });

  it('does NOT classify an empty page as a gate (signals are about gate intent, not absence)', () => {
    // Empty page hits low-word-count and no-trust-nav-links but lacks the
    // login-shaped signals. It's a broken page, not a gate. We expect
    // exactly 2 signals (below threshold).
    const html = '<html></html>';
    const result = detectGatePage(loadHtml(html));
    expect(result.isGate).toBe(false);
    expect(result.signals.length).toBeLessThan(3);
  });
});

describe('formatGateBanner', () => {
  it('returns null when isGate is false', () => {
    expect(formatGateBanner({ isGate: false, signals: [] })).toBeNull();
    expect(formatGateBanner({ isGate: false, signals: ['short-title'] })).toBeNull();
  });

  it('formats a human-readable banner when isGate is true', () => {
    const banner = formatGateBanner({
      isGate: true,
      signals: ['short-title', 'login-keyword-in-title', 'password-input-present'],
    });
    expect(banner).not.toBeNull();
    expect(banner).toContain('logged-out gate page');
    expect(banner).toContain('actionable results');
    expect(banner).toContain('short title');
    expect(banner).toContain('login keyword in title');
    expect(banner).toContain('password input on page');
  });
});
