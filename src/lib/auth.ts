import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase';

const COOKIE_NAME = 'eluzai_admin_session';
const SESSION_TTL = 60 * 60 * 8;
const REMEMBER_TTL = 60 * 60 * 24 * 30;

function secret() {
  const value =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!value) throw new Error('AUTH_SECRET must be configured.');
  return value;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Create a server-side revocable session. The cookie holds an opaque random
 * token; the DB stores only its SHA-256 hash, so a leaked cookie can be
 * revoked and a token hash leak can never be replayed.
 */
export async function createSession(userId: string, remember: boolean) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + (remember ? REMEMBER_TTL : SESSION_TTL) * 1000);
  const { error } = await createServiceClient()
    .from('sessions')
    .insert({
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: expiresAt.toISOString(),
    });
  if (error) throw error;
  return token;
}

async function verifySession(value: string | undefined) {
  if (!value) return null;
  const { data } = await createServiceClient()
    .from('sessions')
    .select('user_id')
    .eq('token_hash', hashToken(value))
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  return data?.user_id || null;
}

export function setSessionCookie(value: string, remember: boolean) {
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: remember ? REMEMBER_TTL : SESSION_TTL,
  });
}

/**
 * Clear the session: revoke the server-side session row first (so the cookie
 * can no longer authenticate anywhere), then expire the cookie client-side.
 */
export async function clearSessionCookie() {
  const value = cookies().get(COOKIE_NAME)?.value;
  if (value) {
    await createServiceClient()
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', hashToken(value))
      .is('revoked_at', null);
  }
  cookies().set(COOKIE_NAME, '', { httpOnly: true, expires: new Date(0), path: '/' });
}

export async function getSessionUser() {
  const userId = await verifySession(cookies().get(COOKIE_NAME)?.value);
  if (!userId) return null;
  const { data } = await createServiceClient().from('users').select('id, name, email, username, is_admin').eq('id', userId).eq('is_admin', true).single();
  return data || null;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createScanToken(type: 'event' | 'activity', id: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
  const payload = `scan.${type}.${id}.${expiresAt}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export function verifyScanToken(value: string | undefined, type: string, id: string): boolean {
  if (!value) return false;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return false;
  const payload = Buffer.from(encoded, 'base64url').toString();
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const [, tokenType, tokenId, expiresAt] = payload.split('.');
  return tokenType === type && tokenId === id && Number(expiresAt) >= Math.floor(Date.now() / 1000);
}


