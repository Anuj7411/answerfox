import 'nextra-theme-docs/style.css';
import type { Metadata } from 'next';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Answerable',
    template: '%s — Answerable',
  },
  description: 'The drop-in SEO toolkit that makes any site answerable by AI search engines.',
  metadataBase: new URL('https://answerable.dev'),
};

const navbar = (
  <Navbar
    logo={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Answerable</span>}
    projectLink="https://github.com/Anuj7411/answerable"
  />
);

const footer = (
  <Footer>
    <span>MIT © 2026 Anuj Ojha · The community version is complete and free, forever.</span>
  </Footer>
);

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Anuj7411/answerable/tree/main/apps/docs"
          footer={footer}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
