import {useTranslations} from 'next-intl';

export function SiteFooter() {
  const t = useTranslations('footer');

  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pb-8 pt-6">
      <div>
        <h2 className="font-display text-[17px] text-fg">{t('title')}</h2>
        <p className="mt-1 text-xs text-fg-muted">{t('description')}</p>
      </div>
      <a
        href="https://github.com/Pratametheus"
        target="_blank"
        rel="noopener noreferrer"
        className="border-b border-accent pb-0.5 text-xs text-accent transition-colors hover:text-fg"
      >
        {t('githubCta')} <span aria-hidden="true">↗</span>
      </a>
      <small className="w-full text-[10px] text-fg-muted">{t('copyright')}</small>
    </footer>
  );
}
