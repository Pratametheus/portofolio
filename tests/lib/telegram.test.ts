import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest';
import {sendGuestbookTelegramAlert} from '@/lib/telegram';

describe('sendGuestbookTelegramAlert', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false without calling fetch if token or chatId is missing', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendGuestbookTelegramAlert({
      name: 'Rin',
      message: 'Halo Ferry!',
      botToken: '',
      chatId: ''
    });

    expect(result).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends formatted markdown message to telegram bot API when credentials are provided', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ok: true});
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendGuestbookTelegramAlert({
      name: 'Rin',
      message: 'Halo Ferry!',
      website: 'https://example.com',
      botToken: '123456:ABC-DEF',
      chatId: '987654321'
    });

    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.telegram.org/bot123456:ABC-DEF/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: expect.stringContaining('Pesan Baru di Buku Tamu')
      })
    );
  });

  it('fails open and returns false when telegram api throws network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network timeout')));

    const result = await sendGuestbookTelegramAlert({
      name: 'Rin',
      message: 'Halo!',
      botToken: 'token',
      chatId: 'chat'
    });

    expect(result).toBe(false);
  });
});
