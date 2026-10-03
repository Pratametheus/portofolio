import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest';
import {assertAdminAuth} from '@/lib/auth';

const mockHeaders = vi.fn();
vi.mock('next/headers', () => ({
  headers: () => mockHeaders()
}));

describe('assertAdminAuth', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockHeaders.mockReset();
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
  });

  it('allows access in non-production environments without headers', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    const identity = await assertAdminAuth();
    expect(identity).toBe('dev@local');
    expect(mockHeaders).not.toHaveBeenCalled();
  });

  it('allows access in production when cf-access-authenticated-user-email matches default admin', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    mockHeaders.mockResolvedValue(
      new Map([['cf-access-authenticated-user-email', 'ferryandhikapratama@gmail.com']])
    );

    const identity = await assertAdminAuth();
    expect(identity).toBe('ferryandhikapratama@gmail.com');
  });

  it('allows access in production when email matches ALLOWED_ADMIN_EMAILS env var', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    (process.env as Record<string, string | undefined>).ALLOWED_ADMIN_EMAILS = 'custom@example.com, other@example.com';
    mockHeaders.mockResolvedValue(
      new Map([['cf-access-authenticated-user-email', 'other@example.com']])
    );

    const identity = await assertAdminAuth();
    expect(identity).toBe('other@example.com');
  });

  it('throws in production when email is not in the admin allowlist', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    mockHeaders.mockResolvedValue(
      new Map([['cf-access-authenticated-user-email', 'stranger@example.com']])
    );

    await expect(assertAdminAuth()).rejects.toThrow(/not in the admin allowlist/);
  });

  it('throws in production when cf-access-authenticated-user-email is missing', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    mockHeaders.mockResolvedValue(new Map());

    await expect(assertAdminAuth()).rejects.toThrow(/Unauthorized/);
  });

  it('throws in production when cf-access-authenticated-user-email is blank', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    mockHeaders.mockResolvedValue(
      new Map([['cf-access-authenticated-user-email', '   ']])
    );

    await expect(assertAdminAuth()).rejects.toThrow(/Unauthorized/);
  });
});
