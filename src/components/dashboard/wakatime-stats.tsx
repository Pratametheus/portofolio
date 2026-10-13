import type {WakaTimeStatsData} from '@/lib/services/telemetry';

export function WakaTimeStats({stats}: {stats: WakaTimeStatsData}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="grid gap-4 border-b border-border/60 pb-5 sm:grid-cols-2">
        <div className="rounded-lg border border-border/40 bg-bg p-4">
          <span className="font-mono text-xs text-fg-muted">Waktu Coding (7 Hari Terakhir)</span>
          <p className="mt-1 font-display text-2xl font-semibold text-fg">{stats.totalTime}</p>
        </div>
        <div className="rounded-lg border border-border/40 bg-bg p-4">
          <span className="font-mono text-xs text-fg-muted">Rata-rata Harian</span>
          <p className="mt-1 font-display text-2xl font-semibold text-fg">{stats.dailyAverage}</p>
        </div>
      </div>

      <div className="mt-5">
        <span className="font-mono text-xs text-fg-muted">Bahasa yang Sering Digunakan</span>
        <div className="mt-3 space-y-3">
          {stats.languages.slice(0, 5).map((lang) => (
            <div key={lang.name}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-fg">{lang.name}</span>
                <span className="font-mono text-fg-muted">{Math.round(lang.percent)}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{width: `${lang.percent}%`}}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
