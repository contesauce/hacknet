// Base64url helpers (no padding), used for JWT parsing and session cookies.

export function base64urlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function bytesToBase64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64urlToJson<T>(s: string): T {
  return JSON.parse(new TextDecoder().decode(base64urlToBytes(s)));
}

export function jsonToBase64url(obj: unknown): string {
  return bytesToBase64url(new TextEncoder().encode(JSON.stringify(obj)));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/** Sign a JSON-serializable payload into `payload.signature` (base64url each side). */
export async function signSession(payload: unknown, secret: string): Promise<string> {
  const body = jsonToBase64url(payload);
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return `${body}.${bytesToBase64url(new Uint8Array(sig))}`;
}

/** Verify and decode a session token produced by signSession. Returns null if invalid/tampered/expired. */
export async function verifySession<T extends { exp: number }>(token: string, secret: string): Promise<T | null> {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify('HMAC', key, base64urlToBytes(sig), new TextEncoder().encode(body));
  if (!valid) return null;
  const payload = base64urlToJson<T>(body);
  if (payload.exp < Date.now() / 1000) return null;
  return payload;
}

export function randomToken(): string {
  return bytesToBase64url(crypto.getRandomValues(new Uint8Array(24)));
}
