import nextra from 'nextra';

const withNextra = nextra({
  // Use Nextra's defaults; theme components are imported in app/layout.tsx.
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode is on by default in Next 15.
};

export default withNextra(nextConfig);
