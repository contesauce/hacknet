import { base64urlToBytes, base64urlToJson } from './util';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

export interface GoogleClaims {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  exp: number;
  aud: string;
  iss: string;
}

export function buildAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForIdToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  const json = await res.json<{ id_token: string }>();
  return json.id_token;
}

interface Jwk {
  kid: string;
  n: string;
  e: string;
  kty: string;
  alg: string;
}

let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;

async function getGoogleJwks(): Promise<Jwk[]> {
  // Cache for the life of the isolate — Google rotates these infrequently.
  if (jwksCache && Date.now() - jwksCache.fetchedAt < 60 * 60 * 1000) return jwksCache.keys;
  const res = await fetch(GOOGLE_JWKS_URL);
  const json = await res.json<{ keys: Jwk[] }>();
  jwksCache = { keys: json.keys, fetchedAt: Date.now() };
  return json.keys;
}

/** Verify a Google-issued id_token's RS256 signature and standard claims. Throws on any failure. */
export async function verifyGoogleIdToken(idToken: string, clientId: string): Promise<GoogleClaims> {
  const [headerB64, payloadB64, sigB64] = idToken.split('.');
  if (!headerB64 || !payloadB64 || !sigB64) throw new Error('malformed id_token');

  const header = base64urlToJson<{ kid: string; alg: string }>(headerB64);
  if (header.alg !== 'RS256') throw new Error(`unexpected alg: ${header.alg}`);

  const jwks = await getGoogleJwks();
  const jwk = jwks.find(k => k.kid === header.kid);
  if (!jwk) throw new Error('no matching JWKS key (Google may have rotated keys — retry)');

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64urlToBytes(sigB64),
    new TextEncoder().encode(`${headerB64}.${payloadB64}`),
  );
  if (!valid) throw new Error('id_token signature verification failed');

  const claims = base64urlToJson<GoogleClaims>(payloadB64);
  if (claims.aud !== clientId) throw new Error('id_token audience mismatch');
  if (claims.iss !== 'https://accounts.google.com' && claims.iss !== 'accounts.google.com') {
    throw new Error('id_token issuer mismatch');
  }
  if (claims.exp < Date.now() / 1000) throw new Error('id_token expired');

  return claims;
}
