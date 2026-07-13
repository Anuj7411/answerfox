/**
 * SSRF guard for the public, no-auth scanner. The scanner fetches a
 * user-supplied URL server-side, so it must refuse anything that could
 * reach the host's own network: loopback, private ranges, and the cloud
 * metadata endpoint. Pure and dependency-free so the rules are unit
 * tested rather than trusted.
 *
 * This blocks by literal host/IP only. It does NOT resolve DNS, so a
 * public hostname that resolves to a private IP still passes here;
 * defense-in-depth (egress rules / a fetch that refuses private IPs)
 * belongs at the network layer before public launch.
 */

const BLOCKED_HOSTS = new Set(['localhost', '0.0.0.0', '::1', 'metadata.google.internal']);

function isPrivateIpv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m === null) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export type ScanUrlCheck = { readonly ok: true; readonly url: string } | { readonly ok: false; readonly reason: string };

export function validateScanUrl(raw: string): ScanUrlCheck {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, reason: 'Enter a valid URL, including https://.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Only http and https URLs can be scanned.' };
  }
  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith('.localhost') || isPrivateIpv4(host)) {
    return { ok: false, reason: 'That host is not publicly scannable.' };
  }
  return { ok: true, url: parsed.toString() };
}
