'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {THEMES, THEME_STORAGE_KEY, DEFAULT_THEME, type Theme} from '@/lib/theme';

export function resolveInitialTheme(stored: string | null, prefersLight: boolean): Theme {
  if (stored === 'light' || stored === 'night') return stored;
  return prefersLight ? 'light' : 'night';
}

const LABEL_KEY: Record<Theme, 'sidebar.themeLight' | 'sidebar.themeNight'> = {
  light: 'sidebar.themeLight',
  night: 'sidebar.themeNight'
};

export default function ThemeToggle() {
  const t = useTranslations();
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
    <div role="group" aria-label={t('sidebar.themeGroupLabel')} className="inline-flex border border-border p-0.5">
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => choose(option)}
          className="min-h-11 min-w-11 px-3 py-2 font-mono text-xs text-fg-muted transition-[background-color,color] duration-200 aria-pressed:bg-surface-2 aria-pressed:text-fg"
        >
          {t(LABEL_KEY[option])}
        </button>
      ))}
    </div>
  );
}
