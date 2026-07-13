/**
 * Pull our `site_id` out of a Polar webhook payload's metadata. Polar
 * copies checkout metadata onto the order and subscription, so both
 * `order.paid` and `subscription.*` events carry it. Metadata values are
 * typed string | number | boolean, so we accept only a non-empty string
 * and return null otherwise, letting the webhook handler no-op instead of
 * throwing on a malformed or absent value. This is the load-bearing link
 * between a payment and the site it upgrades, so it is unit tested.
 */
export function siteIdFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  const value = metadata?.site_id;
  return typeof value === 'string' && value.length > 0 ? value : null;
}
