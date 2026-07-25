import 'server-only';
import {
  type WeeklyDigestData,
  renderWeeklyDigestText,
  weeklyDigestSubject,
} from './digest-format';

const FROM_ADDRESS = process.env.ALERT_FROM_EMAIL ?? 'alerts@answerfox.dev';

/**
 * Send one weekly digest email. Same transport as the score-drop alert
 * (`send-alert.ts`): Resend when `RESEND_API_KEY` is set, otherwise the
 * rendered email is logged to the server console so the whole cron flow
 * works end-to-end in dev without an external dependency.
 *
 * Never throws — returns { ok:false, reason } so the cron route can
 * count failures per user without one bad address aborting the sweep.
 */
export async function sendWeeklyDigest(
  data: WeeklyDigestData,
): Promise<{ ok: true; backend: 'resend' | 'console' } | { ok: false; reason: string }> {
  const subject = weeklyDigestSubject(data);
  const text = renderWeeklyDigestText(data);

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey === undefined || apiKey.length === 0) {
    console.log(`[weekly-digest][console-fallback] to=${data.email} subject=${subject}`);
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
        to: [data.email],
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
