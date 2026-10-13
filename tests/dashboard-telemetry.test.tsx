import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {ContributionCalendar} from '@/components/dashboard/contribution-calendar';
import {WakaTimeStats} from '@/components/dashboard/wakatime-stats';

describe('ContributionCalendar', () => {
  it('renders total contributions and contribution grid', () => {
    const mockData = {
      totalContributions: 240,
      weeks: [
        {
          contributionDays: [
            {date: '2026-10-01', contributionCount: 4, color: '#25282a'},
            {date: '2026-10-02', contributionCount: 8, color: '#8f5f18'}
          ]
        }
      ]
    };

    render(<ContributionCalendar data={mockData} />);
    expect(screen.getByText(/240/)).toBeInTheDocument();
    expect(screen.getByText(/kontribusi/i)).toBeInTheDocument();
  });
});

describe('WakaTimeStats', () => {
  it('renders total hours, daily average and language bars', () => {
    const mockStats = {
      totalTime: '45 hrs 20 mins',
      dailyAverage: '6 hrs 12 mins',
      languages: [
        {name: 'TypeScript', percent: 70, text: '31 hrs'},
        {name: 'Rust', percent: 30, text: '14 hrs'}
      ]
    };

    render(<WakaTimeStats stats={mockStats} />);
    expect(screen.getByText('45 hrs 20 mins')).toBeInTheDocument();
    expect(screen.getByText('6 hrs 12 mins')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });
});
