import {useTranslations} from 'next-intl';
import {Icon} from '@/components/icon';

export function SocialCard({variant}: {variant: 'github' | 'email'}) {
  const t = useTranslations();

  if (variant === 'github') {
    return (
      <a
        href="https://github.com/Pratametheus"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent sm:p-6"
      >
        <span className="flex items-center gap-2 font-mono text-xs text-fg-muted">
          <Icon name="code" className="size-4 text-accent" />
          {t('contact.githubLabel')}
        </span>
        <h3 className="font-display text-lg font-semibold text-fg sm:text-xl">{t('contact.github.title')}</h3>
        <p className="text-sm leading-relaxed text-fg-muted">{t('contact.github.body')}</p>
        <strong className="mt-auto pt-2 text-xs font-medium text-accent">
          {t('contact.github.cta')} ↗
        </strong>
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <span className="flex items-center gap-2 font-mono text-xs text-fg-muted">
        <Icon name="contact" className="size-4 text-accent" />
        {t('contact.emailLabel')}
      </span>
      <h3 className="font-display text-lg font-semibold text-fg sm:text-xl">{t('contact.email.title')}</h3>
      <p className="text-sm leading-relaxed text-fg-muted">{t('contact.email.body')}</p>
      <small className="mt-auto pt-2 font-mono text-[11px] text-fg-muted">{t('contact.email.status')}</small>
    </div>
  );
}
