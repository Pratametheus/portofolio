import {headers} from 'next/headers';

/**
 * Asserts that the request carries Cloudflare Access authentication.
 *
 * Cloudflare Access gates `/admin*` at the edge and attaches the authenticated
 * identity in the `Cf-Access-Authenticated-User-Email` header.
 *
 * In non-production environments (local dev and unit/e2e tests), authentication
 * is bypassed so local workflows work without a live Zero Trust connection.
 *
 * In production, any access to admin pages or execution of admin Server Actions
 * without a valid Cloudflare Access header will be rejected immediately.
 */
export async function assertAdminAuth(): Promise<string> {
  if (process.env.NODE_ENV !== 'production') {
    return 'dev@local';
  }

  const headerList = await headers();
  const email = headerList.get('cf-access-authenticated-user-email');

  if (!email || email.trim() === '') {
    throw new Error('Unauthorized: missing Cloudflare Access identity header');
  }

  return email.trim();
}
