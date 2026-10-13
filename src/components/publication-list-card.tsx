import {useTranslations} from 'next-intl';
import {getPathname} from '@/i18n/navigation';
import {PublicationCover} from '@/components/publication-cover';
import {RecordTags} from './record-tags';
import {DecryptedText} from '@/components/effects/decrypted-text';
import {ACHIEVEMENT_TYPE_LABEL_KEY, ACHIEVEMENT_CATEGORY_LABEL_KEY} from '@/lib/taxonomy-labels';
import type {Achievement} from '@/lib/repositories/achievements';
import type {Locale} from '@/content/types';

export function PublicationListCard({item, href}: {item: Achievement; href: string}) {
  const t = useTranslations();

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface sm:flex">
      <a href={href} className="block sm:w-64 sm:shrink-0">
        <PublicationCover size="list" coverUrl={item.coverUrl} />
      </a>
      <div className="p-6">
        <span className="font-mono text-xs text-fg-muted">
          {`${t(ACHIEVEMENT_CATEGORY_LABEL_KEY[item.category])} · ${t(ACHIEVEMENT_TYPE_LABEL_KEY[item.type])}`}
        </span>
        <h3 className="mt-1.5 font-display text-lg font-semibold text-fg">
          <a href={href} className="transition-colors hover:text-accent">
            <DecryptedText text={item.title} />
          </a>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.description}</p>
        <div className="mt-4">
          <RecordTags tags={[t(ACHIEVEMENT_CATEGORY_LABEL_KEY[item.category]), 'SINTA 2']} />
        </div>
        <a href={href} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-fg">
          {t('research.listCardCta')} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export function PaperStory({item, locale}: {item: Achievement; locale: Locale}) {
  const t = useTranslations();
  const relatedHref = getPathname({locale, href: {pathname: '/karya/[slug]', params: {slug: 'city-courier'}}});

  return (
    <div>
      <PublicationCover size="list" coverUrl={item.coverUrl} />
      <article className="mt-6 max-w-2xl">
        <section className="border-b border-border py-6">
          <h2 className="font-display text-lg font-semibold text-fg sm:text-xl">{t('research.paper.focusTitle')}</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-fg-muted sm:text-[15px]">{t('research.paper.focusBody')}</p>
        </section>
        <section className="border-b border-border py-6">
          <h2 className="font-display text-lg font-semibold text-fg sm:text-xl">{t('research.paper.methodTitle')}</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-fg-muted sm:text-[15px]">{t('research.paper.methodBody')}</p>
        </section>
        <section className="border-b border-border py-6">
          <h2 className="font-display text-lg font-semibold text-fg sm:text-xl">{t('research.paper.pubTitle')}</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-fg-muted sm:text-[15px]">{item.description}</p>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-medium text-accent transition-colors hover:text-fg">
              {t('research.paper.readAtPublisher')}
            </a>
          ) : null}
        </section>
        <section className="py-6">
          <h2 className="font-display text-lg font-semibold text-fg sm:text-xl">{t('research.paper.relatedTitle')}</h2>
          <a href={relatedHref} className="mt-3 inline-block text-xs font-medium text-accent transition-colors hover:text-fg">
            City Courier ↗
          </a>
        </section>
      </article>
    </div>
  );
}
