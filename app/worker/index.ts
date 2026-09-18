import type { Env } from './env';
import { buildAuthUrl, exchangeCodeForIdToken, verifyGoogleIdToken } from './auth';
import { signSession, verifySession, randomToken } from './util';
import { parseCookies, setCookie, clearCookie } from './cookies';

const SESSION_COOKIE = 'async_os_session';
const STATE_COOKIE = 'async_os_oauth_state';
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

function redirectUriFor(url: URL): string {
  return `${url.origin}/api/auth/callback`;
}

async function handleLogin(url: URL, env: Env): Promise<Response> {
  const state = randomToken();
  const authUrl = buildAuthUrl(env.GOOGLE_CLIENT_ID, redirectUriFor(url), state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
      'Set-Cookie': setCookie(STATE_COOKIE, state, { maxAgeSec: 600 }),
    },
  });
}

async function handleCallback(url: URL, request: Request, env: Env): Promise<Response> {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(request.headers.get('Cookie'));

  if (!code || !state || state !== cookies[STATE_COOKIE]) {
    return new Response('invalid OAuth state', { status: 400 });
  }

  try {
    const idToken = await exchangeCodeForIdToken(code, env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUriFor(url));
    const claims = await verifyGoogleIdToken(idToken, env.GOOGLE_CLIENT_ID);

    const session: SessionPayload = {
      sub: claims.sub,
      email: claims.email,
      name: claims.name ?? claims.email,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
    };
    const token = await signSession(session, env.SESSION_SECRET);

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': setCookie(SESSION_COOKIE, token, { maxAgeSec: SESSION_TTL_SEC }),
      },
    });
  } catch (e) {
    return new Response(`sign-in failed: ${(e as Error).message}`, { status: 400 });
  }
}

async function handleLogout(): Promise<Response> {
  return new Response(null, {
    status: 302,
    headers: { Location: '/', 'Set-Cookie': clearCookie(SESSION_COOKIE) },
  });
}

async function handleMe(request: Request, env: Env): Promise<Response> {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies[SESSION_COOKIE];
  const session = token ? await verifySession<SessionPayload>(token, env.SESSION_SECRET) : null;
  return Response.json(session ? { loggedIn: true, email: session.email, name: session.name } : { loggedIn: false });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/auth/login') return handleLogin(url, env);
    if (url.pathname === '/api/auth/callback') return handleCallback(url, request, env);
    if (url.pathname === '/api/auth/logout') return handleLogout();
    if (url.pathname === '/api/auth/me') return handleMe(request, env);

    return env.ASSETS.fetch(request);
  },
};
