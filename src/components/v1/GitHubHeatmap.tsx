'use client';
import { useEffect, useState } from 'react';

interface ContributionDay {
  date: string;
  count: number;
}

interface WeekData {
  days: ContributionDay[];
}

export default function GitHubHeatmap() {
  const [weeks, setWeeks] = useState<WeekData[] | null>(null);
  const [error, setError] = useState(false);
  const [totalContributions, setTotalContributions] = useState(0);

  useEffect(() => {
    fetch('/api/github/contributions')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setWeeks(data.weeks);
        setTotalContributions(data.totalContributions);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
        <a
          href="https://github.com/ckwame-jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-primary)] underline underline-offset-4 decoration-[var(--link-decoration)] hover:decoration-[var(--text-primary)] transition text-sm"
        >
          View my GitHub activity
        </a>
      </div>
    );
  }

  if (!weeks) {
    return (
      <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
        <div className="h-[104px] rounded-lg bg-[var(--card-bg)] animate-pulse" />
      </div>
    );
  }

  const getColor = (count: number): string => {
    if (count === 0) return 'var(--card-bg)';
    if (count <= 2) return 'rgba(34, 197, 94, 0.3)';
    if (count <= 5) return 'rgba(34, 197, 94, 0.5)';
    if (count <= 8) return 'rgba(34, 197, 94, 0.7)';
    return 'rgba(34, 197, 94, 0.9)';
  };

  return (
    <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--text-muted)]">
          {totalContributions} contributions in the last year
        </p>
        <a
          href="https://github.com/ckwame-jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        >
          @ckwame-jpg
        </a>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px]" style={{ minWidth: 'max-content' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.days.map((day) => (
                <div
                  key={day.date}
                  className="w-[11px] h-[11px] rounded-sm transition-colors"
                  style={{ backgroundColor: getColor(day.count) }}
                  title={`${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end text-xs text-[var(--text-muted)]">
        <span>Less</span>
        {[0, 2, 5, 8, 12].map((count) => (
          <div
            key={count}
            className="w-[11px] h-[11px] rounded-sm"
            style={{ backgroundColor: getColor(count) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
