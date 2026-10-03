import {headers} from 'next/headers';

export const DEFAULT_ADMIN_EMAIL = 'ferryandhikapratama@gmail.com';

export function getAllowedAdminEmails(): string[] {
  const envEmails = process.env.ALLOWED_ADMIN_EMAILS || process.env.ADMIN_EMAIL;
  if (envEmails && envEmails.trim() !== '') {
    return envEmails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return [DEFAULT_ADMIN_EMAIL];
}

/**
 * Asserts that the request carries Cloudflare Access authentication and that
 * the identity matches an authorized admin email.
 *
 * Cloudflare Access gates `/admin*` at the edge and attaches the authenticated
 * identity in the `Cf-Access-Authenticated-User-Email` header.
 *
 * In non-production environments (local dev and unit/e2e tests), authentication
 * is bypassed so local workflows work without a live Zero Trust connection.
 *
 * In production, any access to admin pages or execution of admin Server Actions
 * without a valid Cloudflare Access header matching an authorized admin email
 * will be rejected immediately.
 */
export async function assertAdminAuth(): Promise<string> {
  if (process.env.NODE_ENV !== 'production') {
    return 'dev@local';
  }

  const headerList = await headers();
  const rawEmail = headerList.get('cf-access-authenticated-user-email');

  if (!rawEmail || rawEmail.trim() === '') {
    throw new Error('Unauthorized: missing Cloudflare Access identity header');
  }

  const email = rawEmail.trim().toLowerCase();
  const allowed = getAllowedAdminEmails();
  if (!allowed.includes(email)) {
    throw new Error(`Unauthorized: email ${rawEmail.trim()} is not in the admin allowlist`);
  }

  return rawEmail.trim();
}
