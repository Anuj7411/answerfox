import { Checkout } from '@polar-sh/nextjs';

/**
 * Polar checkout entrypoint. The per-site "Upgrade" link points here with
 * `?products=<id>&customerEmail=<email>&metadata=<url-encoded {site_id}>`;
 * the adapter creates the Polar checkout (carrying our metadata) and
 * redirects the user to Polar-hosted checkout. Env-gated: without a Polar
 * token the route returns 503 rather than crashing, and the upgrade CTA
 * is hidden until Polar is configured, so users never reach a broken
 * checkout.
 */
const accessToken = process.env.POLAR_ACCESS_TOKEN;
const server = process.env.POLAR_SERVER === 'sandbox' ? 'sandbox' : 'production';

export const GET = accessToken
  ? Checkout({
      accessToken,
      successUrl: process.env.POLAR_SUCCESS_URL,
      server,
    })
  : async () => new Response('Payments are not configured.', { status: 503 });
