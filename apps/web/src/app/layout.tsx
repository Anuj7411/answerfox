import { PostHogProvider } from '@/components/providers/posthog-provider';
import type { Metadata } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import { type ReactNode, Suspense } from 'react';
import './globals.css';

// Porcelain design system fonts, self-hosted at build time by next/font
// (no third-party CDN, no FOIT). Archivo is the display + body face
// (bold Archivo stands in for the "expanded" display look), JetBrains
// Mono the numeric/label mono.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Answerfox',
  description:
    'The AI-readiness layer for your codebase. Get cited by AI, usable by agents, shipped as pull requests.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Suspense fallback={null}>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
