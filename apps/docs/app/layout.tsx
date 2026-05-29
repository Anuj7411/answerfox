import 'nextra-theme-docs/style.css';
import type { Metadata } from 'next';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Answerfox',
    template: '%s — Answerfox',
  },
  description: 'The drop-in SEO toolkit that makes any site answerable by AI search engines.',
  metadataBase: new URL('https://answerfox.dev'),
};

const navbar = (
  <Navbar
    logo={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Answerfox</span>}
    projectLink="https://github.com/Anuj7411/answerfox"
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
          docsRepositoryBase="https://github.com/Anuj7411/answerfox/tree/main/apps/docs"
          footer={footer}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
