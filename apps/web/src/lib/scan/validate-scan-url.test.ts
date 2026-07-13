import { describe, expect, it } from 'vitest';
import { validateScanUrl } from './validate-scan-url';

describe('validateScanUrl', () => {
  it('accepts public http and https URLs', () => {
    expect(validateScanUrl('https://example.com')).toEqual({
      ok: true,
      url: 'https://example.com/',
    });
    expect(validateScanUrl('http://8.8.8.8/docs').ok).toBe(true);
  });

  it('rejects non-http(s) schemes', () => {
    expect(validateScanUrl('ftp://example.com').ok).toBe(false);
    expect(validateScanUrl('file:///etc/passwd').ok).toBe(false);
    expect(validateScanUrl('javascript:alert(1)').ok).toBe(false);
  });

  it('rejects loopback and metadata hosts', () => {
    expect(validateScanUrl('http://localhost:3000').ok).toBe(false);
    expect(validateScanUrl('http://app.localhost').ok).toBe(false);
    expect(validateScanUrl('http://127.0.0.1').ok).toBe(false);
    expect(validateScanUrl('http://169.254.169.254/latest/meta-data').ok).toBe(false);
    expect(validateScanUrl('http://metadata.google.internal').ok).toBe(false);
  });

  it('rejects private IPv4 ranges', () => {
    expect(validateScanUrl('http://10.0.0.1').ok).toBe(false);
    expect(validateScanUrl('http://172.16.0.1').ok).toBe(false);
    expect(validateScanUrl('http://172.31.255.255').ok).toBe(false);
    expect(validateScanUrl('http://192.168.1.1').ok).toBe(false);
  });

  it('allows public IPs just outside the private ranges', () => {
    expect(validateScanUrl('http://172.32.0.1').ok).toBe(true);
    expect(validateScanUrl('http://11.0.0.1').ok).toBe(true);
  });

  it('rejects garbage input', () => {
    expect(validateScanUrl('not a url').ok).toBe(false);
    expect(validateScanUrl('').ok).toBe(false);
  });
});
