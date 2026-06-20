import 'server-only';

interface ScoreDropAlertArgs {
  readonly toEmail: string;
  readonly siteName: string;
  readonly siteUrl: string;
  readonly siteDetailUrl: string;
  readonly currentScore: number;
  readonly previousScore: number;
  readonly threshold: number;
}

const SUBJECT_PREFIX = 'Answerfox · score dropped';
const FROM_ADDRESS = process.env.ALERT_FROM_EMAIL ?? 'alerts@answerfox.dev';

/**
 * Send a score-drop alert email. Uses Resend when `RESEND_API_KEY`
 * is set, otherwise logs the rendered email to the server console so
 * the feature works end-to-end in dev without an external dependency
 * (same shape as the AI fix generator's GEMINI_API_KEY fallback).
 *
 * Returns { ok: true } on success and { ok: false, reason } on failure.
 * Callers should never crash the audit pipeline on a failed alert —
 * the audit itself succeeded; the notification is gravy.
 */
export async function sendScoreDropAlert(
  args: ScoreDropAlertArgs,
): Promise<{ ok: true; backend: 'resend' | 'console' } | { ok: false; reason: string }> {
  const { toEmail, siteName, siteUrl, siteDetailUrl, currentScore, previousScore, threshold } =
    args;
  const subject = `${SUBJECT_PREFIX}: ${siteName} ${previousScore} → ${currentScore}`;
  const text = renderText({
    siteName,
    siteUrl,
    siteDetailUrl,
    currentScore,
    previousScore,
    threshold,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey === undefined || apiKey.length === 0) {
    console.log(`[score-drop-alert][console-fallback] to=${toEmail} subject=${subject}`);
    console.log(text);
    return { ok: true, backend: 'console' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [toEmail],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, reason: `resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true, backend: 'resend' };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'unknown send error' };
  }
}

function renderText(args: {
  siteName: string;
  siteUrl: string;
  siteDetailUrl: string;
  currentScore: number;
  previousScore: number;
  threshold: number;
}): string {
  return [
    `Your site ${args.siteName} (${args.siteUrl}) dropped below the score threshold you set.`,
    '',
    `Previous score: ${args.previousScore}/100`,
    `Current score:  ${args.currentScore}/100`,
    `Threshold:      ${args.threshold}/100`,
    '',
    `Open the site to see what changed: ${args.siteDetailUrl}`,
    '',
    '— Answerfox',
  ].join('\n');
}
