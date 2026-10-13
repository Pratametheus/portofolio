import type {GitHubContributionsData} from '@/lib/services/telemetry';

export function ContributionCalendar({data}: {data: GitHubContributionsData}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <span className="font-mono text-xs text-fg-muted">Aktivitas GitHub</span>
          <p className="mt-1 font-display text-lg font-semibold text-fg sm:text-xl">
            <strong className="text-accent">{data.totalContributions}</strong> kontribusi tahun ini
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="flex min-w-[680px] gap-1 pb-2">
          {data.weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.contributionDays.map((day) => {
                const count = day.contributionCount;
                let bgClass = 'bg-surface-2/60';
                if (count > 0 && count <= 2) bgClass = 'bg-accent/30';
                else if (count > 2 && count <= 5) bgClass = 'bg-accent/60';
                else if (count > 5) bgClass = 'bg-accent';

                return (
                  <div
                    key={day.date}
                    title={`${day.date}: ${count} kontribusi`}
                    className={`size-2.5 rounded-[2px] transition-transform hover:scale-125 ${bgClass}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-fg-muted">
        <span>Sedikit</span>
        <div className="size-2 rounded-[2px] bg-surface-2/60" />
        <div className="size-2 rounded-[2px] bg-accent/30" />
        <div className="size-2 rounded-[2px] bg-accent/60" />
        <div className="size-2 rounded-[2px] bg-accent" />
        <span>Banyak</span>
      </div>
    </div>
  );
}
