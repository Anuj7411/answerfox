import { inngest } from '@/lib/inngest/client';
import { openFixPr } from '@/lib/inngest/functions/open-fix-pr';
import { postProof } from '@/lib/inngest/functions/post-proof';
import { serve } from 'inngest/next';

export const runtime = 'nodejs';

/**
 * Inngest ingress: the dev server (and later Inngest Cloud) calls this
 * route to discover and execute functions. Every queue function must
 * be registered here or it silently never runs.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [openFixPr, postProof],
});
