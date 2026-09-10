import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

/**
 * Gate for admin API routes. Defense-in-depth on top of middleware:
 * each handler independently verifies the session, so a misconfigured
 * middleware matcher can never leave an admin route open.
 */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      denied: true,
      response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { user, denied: false, response: undefined };
}