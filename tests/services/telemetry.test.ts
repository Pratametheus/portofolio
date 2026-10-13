import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest';
import {fetchGitHubContributions, fetchWakaTimeStats} from '@/lib/services/telemetry';

describe('telemetry service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchGitHubContributions', () => {
    it('returns null when username is empty', async () => {
      const result = await fetchGitHubContributions('');
      expect(result).toBeNull();
    });

    it('fetches and formats contributions when API returns valid data', async () => {
      const mockResponse = {
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: {
                totalContributions: 142,
                weeks: [
                  {
                    contributionDays: [
                      {date: '2026-10-01', contributionCount: 5, color: '#25282a'}
                    ]
                  }
                ]
              }
            }
          }
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      }));

      const result = await fetchGitHubContributions('Pratametheus', 'dummy-token');
      expect(result).not.toBeNull();
      expect(result?.totalContributions).toBe(142);
      expect(result?.weeks.length).toBe(1);
      expect(result?.weeks[0].contributionDays[0].contributionCount).toBe(5);
    });

    it('returns null safely when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      const result = await fetchGitHubContributions('Pratametheus', 'dummy-token');
      expect(result).toBeNull();
    });
  });

  describe('fetchWakaTimeStats', () => {
    it('returns null when apiKey is missing', async () => {
      const result = await fetchWakaTimeStats('');
      expect(result).toBeNull();
    });

    it('fetches and formats wakatime stats when API returns valid data', async () => {
      const mockResponse = {
        data: {
          human_readable_total_including_other_language: '32 hrs 15 mins',
          human_readable_daily_average_including_other_language: '4 hrs 36 mins',
          languages: [
            {name: 'TypeScript', percent: 65.5, text: '21 hrs 8 mins'},
            {name: 'Rust', percent: 24.5, text: '8 hrs 0 mins'}
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      }));

      const result = await fetchWakaTimeStats('waka_key_123');
      expect(result).not.toBeNull();
      expect(result?.totalTime).toBe('32 hrs 15 mins');
      expect(result?.dailyAverage).toBe('4 hrs 36 mins');
      expect(result?.languages.length).toBe(2);
      expect(result?.languages[0].name).toBe('TypeScript');
    });

    it('returns null safely when API returns non-ok response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      }));

      const result = await fetchWakaTimeStats('invalid_key');
      expect(result).toBeNull();
    });
  });
});
