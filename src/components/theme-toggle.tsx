'use client';

import {useEffect, useState} from 'react';
import {THEMES, THEME_STORAGE_KEY, DEFAULT_THEME, type Theme} from '@/lib/theme';

export function resolveInitialTheme(stored: string | null, prefersLight: boolean): Theme {
  if (stored === 'light' || stored === 'night') return stored;
  return prefersLight ? 'light' : 'night';
}

const LABELS: Record<Theme, {id: string}> = {
  light: {id: 'Terang'},
  night: {id: 'Malam'}
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === 'light' || current === 'night') setTheme(current);
  }, []);

  function choose(next: Theme) {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the choice still applies for this page */
    }
    setTheme(next);
  }

  return (
    <div role="group" aria-label="Tema" className="inline-flex rounded-lg border border-border p-0.5">
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => choose(option)}
          className="min-h-6 rounded-md px-2 py-1 font-mono text-xs text-fg-muted transition-colors aria-pressed:bg-surface-2 aria-pressed:text-fg"
        >
          {LABELS[option].id}
        </button>
      ))}
    </div>
  );
}
