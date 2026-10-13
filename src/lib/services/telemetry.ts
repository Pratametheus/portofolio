export interface GitHubContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface GitHubContributionWeek {
  contributionDays: GitHubContributionDay[];
}

export interface GitHubContributionsData {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
}

export interface WakaTimeLanguage {
  name: string;
  percent: number;
  text: string;
}

export interface WakaTimeStatsData {
  totalTime: string;
  dailyAverage: string;
  languages: WakaTimeLanguage[];
}

const GITHUB_GRAPHQL_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
`;

export async function fetchGitHubContributions(
  username: string,
  token?: string
): Promise<GitHubContributionsData | null> {
  if (!username) return null;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Portfolio-Telemetry'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: GITHUB_GRAPHQL_QUERY,
        variables: {username}
      })
    });

    if (!response.ok) return null;

    const json = (await response.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions?: number;
              weeks?: Array<{
                contributionDays?: Array<{
                  date: string;
                  contributionCount: number;
                  color: string;
                }>;
              }>;
            };
          };
        };
      };
    };

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar || calendar.totalContributions == null || !calendar.weeks) {
      return null;
    }

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks.map((week) => ({
        contributionDays: (week.contributionDays ?? []).map((day) => ({
          date: day.date,
          contributionCount: day.contributionCount,
          color: day.color
        }))
      }))
    };
  } catch (error) {
    return null;
  }
}

export async function fetchWakaTimeStats(
  apiKey?: string
): Promise<WakaTimeStatsData | null> {
  if (!apiKey) return null;

  try {
    const encodedKey = btoa(apiKey);
    const response = await fetch(
      'https://wakatime.com/api/v1/users/current/stats/last_7_days',
      {
        headers: {
          Authorization: `Basic ${encodedKey}`
        }
      }
    );

    if (!response.ok) return null;

    const json = (await response.json()) as {
      data?: {
        human_readable_total_including_other_language?: string;
        human_readable_daily_average_including_other_language?: string;
        languages?: Array<{
          name: string;
          percent: number;
          text: string;
        }>;
      };
    };

    const data = json.data;
    if (!data) return null;

    return {
      totalTime: data.human_readable_total_including_other_language ?? '0 hrs',
      dailyAverage: data.human_readable_daily_average_including_other_language ?? '0 hrs',
      languages: (data.languages ?? []).map((lang) => ({
        name: lang.name,
        percent: lang.percent,
        text: lang.text
      }))
    };
  } catch (error) {
    return null;
  }
}
