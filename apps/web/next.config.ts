import type { NextConfig } from 'next';

const config: NextConfig = {
  // Vercel-first deploy. Strict mode is on by default in Next 15.
  // The OpenNext Cloudflare adapter is added later, at the Cloudflare
  // migration milestone, not now.
};

export default config;
