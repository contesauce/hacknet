import type { Env } from './env';
import { verifySession } from './util';
import { parseCookies } from './cookies';

export const SESSION_COOKIE = 'async_os_session';
export const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

export async function getSession(request: Request, env: Env): Promise<SessionPayload | null> {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies[SESSION_COOKIE];
  return token ? verifySession<SessionPayload>(token, env.SESSION_SECRET) : null;
}
