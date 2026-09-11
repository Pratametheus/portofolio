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
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
      >
        <span className="flex items-center gap-2 text-xs text-fg-muted">
          <Icon name="code" className="size-4 text-accent" />
          GitHub
        </span>
        <h3 className="font-display text-xl text-fg">{t('contact.github.title')}</h3>
        <p className="text-sm leading-7 text-fg-muted">{t('contact.github.body')}</p>
        <strong className="mt-auto text-xs font-semibold text-accent">
          {t('contact.github.cta')} ↗
        </strong>
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <span className="flex items-center gap-2 text-xs text-fg-muted">
        <Icon name="contact" className="size-4 text-accent" />
        Email
      </span>
      <h3 className="font-display text-xl text-fg">{t('contact.email.title')}</h3>
      <p className="text-sm leading-7 text-fg-muted">{t('contact.email.body')}</p>
      <small className="mt-auto text-xs text-fg-muted">{t('contact.email.status')}</small>
    </div>
  );
}
