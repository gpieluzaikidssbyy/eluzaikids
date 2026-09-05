import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase';

const COOKIE_NAME = 'eluzai_admin_session';
const SESSION_TTL = 60 * 60 * 8;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('AUTH_SECRET must be configured.');
  return value;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSession(userId: string, remember: boolean) {
  const expiresAt = Math.floor(Date.now() / 1000) + (remember ? 60 * 60 * 24 * 30 : SESSION_TTL);
  const payload = `${userId}.${expiresAt}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export function verifySession(value: string | undefined) {
  if (!value) return null;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return null;
  const payload = Buffer.from(encoded, 'base64url').toString();
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const [userId, expiresAt] = payload.split('.');
  if (!userId || Number(expiresAt) < Math.floor(Date.now() / 1000)) return null;
  return userId;
}

export function setSessionCookie(value: string, remember: boolean) {
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: remember ? 60 * 60 * 24 * 30 : SESSION_TTL,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, '', { httpOnly: true, expires: new Date(0), path: '/' });
}

export async function getSessionUser() {
  const userId = verifySession(cookies().get(COOKIE_NAME)?.value);
  if (!userId) return null;
  const { data } = await createServiceClient().from('users').select('id, name, email, username, is_admin').eq('id', userId).eq('is_admin', true).single();
  return data || null;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createResetToken() {
  return randomBytes(32).toString('hex');
}

export { COOKIE_NAME };
