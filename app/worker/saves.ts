import type { Env } from './env';
import { getSession } from './session';

interface SaveRow {
  state: string;
}

export async function handleSaveGet(request: Request, env: Env): Promise<Response> {
  const session = await getSession(request, env);
  if (!session) return new Response('unauthorized', { status: 401 });
  if (!env.DB) return new Response('save storage not configured', { status: 500 });

  const row = await env.DB.prepare('SELECT state FROM saves WHERE sub = ?').bind(session.sub).first<SaveRow>();
  return Response.json({ state: row ? JSON.parse(row.state) : null });
}

export async function handleSavePut(request: Request, env: Env): Promise<Response> {
  const session = await getSession(request, env);
  if (!session) return new Response('unauthorized', { status: 401 });
  if (!env.DB) return new Response('save storage not configured', { status: 500 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response('invalid JSON body', { status: 400 });
  }

  await env.DB.prepare(
    `INSERT INTO saves (sub, email, state, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(sub) DO UPDATE SET email = excluded.email, state = excluded.state, updated_at = excluded.updated_at`,
  ).bind(session.sub, session.email, JSON.stringify(body), Date.now()).run();

  return Response.json({ ok: true });
}
