import { defineSeo } from '@answerable/metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const SITE_URL = 'https://example.com';
const SITE_NAME = 'Basic Next.js Example';

export const metadata: Metadata = defineSeo({
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description:
    'The minimal example of an Answerable-powered Next.js site. Drop in @answerable/* and your site is SEO + AI-answer-engine ready.',
  url: SITE_URL,
  siteName: SITE_NAME,
  locale: 'en_US',
  image: `${SITE_URL}/og.png`,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Chrome links — drives audit checks D5 (about/trust links in chrome) */}
        <nav>
          <a href="/">Home</a> · <a href="/about">About</a> · <a href="/faq">FAQ</a> ·{' '}
          <a href="/contact">Contact</a>
        </nav>
        {children}
        {/* Footer links — drives audit check D6 (privacy/terms/contact links in footer) */}
        <footer>
          <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·{' '}
          <a href="/contact">Contact</a>
        </footer>
      </body>
    </html>
  );
}
