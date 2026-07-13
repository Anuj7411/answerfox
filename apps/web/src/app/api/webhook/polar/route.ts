import { markSiteFree, markSitePaid } from '@/lib/db/mutations/entitlement';
import { siteIdFromMetadata } from '@/lib/payment/site-id-from-metadata';
import { Webhooks } from '@polar-sh/nextjs';

/**
 * Polar webhook. The adapter verifies the Standard Webhooks signature
 * (HMAC-SHA256) before dispatching, so an unsigned/forged request never
 * reaches these handlers.
 *
 * Entitlement is gated on `order.paid` (payment-confirmed, and it carries
 * the checkout metadata we set) and un-gated when the subscription is
 * canceled or revoked. Every branch resolves the site by the `site_id`
 * we round-tripped through checkout metadata. Env-gated: without a webhook
 * secret the route returns 503.
 */
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

export const POST = webhookSecret
  ? Webhooks({
      webhookSecret,
      onOrderPaid: async (payload) => {
        const siteId = siteIdFromMetadata(payload.data.metadata);
        if (siteId !== null) await markSitePaid(siteId);
      },
      onSubscriptionCanceled: async (payload) => {
        const siteId = siteIdFromMetadata(payload.data.metadata);
        if (siteId !== null) await markSiteFree(siteId);
      },
      onSubscriptionRevoked: async (payload) => {
        const siteId = siteIdFromMetadata(payload.data.metadata);
        if (siteId !== null) await markSiteFree(siteId);
      },
    })
  : async () => new Response('Webhook is not configured.', { status: 503 });
