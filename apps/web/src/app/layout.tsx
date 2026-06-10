import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import { type ReactNode, Suspense } from 'react';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import './globals.css';

// Self-hosted at build time by next/font (no third-party CDN, no FOIT).
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Answerfox',
  description: 'The drop-in SEO toolkit that makes any site answerable by AI search engines.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${inter.variable}`}>
      <body>
        <Suspense fallback={null}>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
