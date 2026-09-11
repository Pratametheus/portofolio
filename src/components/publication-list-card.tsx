import {useTranslations} from 'next-intl';
import {getPathname} from '@/i18n/navigation';
import {PublicationCover} from '@/components/publication-cover';
import {RecordTags} from './record-tags';
import {ACHIEVEMENT_TYPE_LABEL_KEY, ACHIEVEMENT_CATEGORY_LABEL_KEY} from '@/lib/taxonomy-labels';
import type {Achievement} from '@/content/achievements';
import type {Locale} from '@/content/types';

export function PublicationListCard({item, href}: {item: Achievement; href: string}) {
  const t = useTranslations();

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface sm:flex">
      <a href={href} className="block sm:w-64 sm:shrink-0">
        <PublicationCover size="list" />
      </a>
      <div className="p-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">
          {`${t(ACHIEVEMENT_CATEGORY_LABEL_KEY[item.category])} · ${t(ACHIEVEMENT_TYPE_LABEL_KEY[item.type])}`}
        </span>
        <h3 className="mt-2 font-display text-lg text-fg">
          <a href={href} className="transition-colors hover:text-accent">
            {item.title}
          </a>
        </h3>
        <p className="mt-2.5 text-sm leading-7 text-fg-muted">{item.description}</p>
        <RecordTags tags={[t(ACHIEVEMENT_CATEGORY_LABEL_KEY[item.category]), 'SINTA 2']} />
        <a href={href} className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent">
          {t('research.listCardCta')} <span aria-hidden="true">→</span>
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
      <PublicationCover size="list" />
      <article className="mt-6 max-w-2xl">
        <section className="border-b border-border py-6">
          <h2 className="font-display text-xl text-fg">{t('research.paper.focusTitle')}</h2>
          <p className="mt-3 text-[15px] leading-8 text-fg-muted">{t('research.paper.focusBody')}</p>
        </section>
        <section className="border-b border-border py-6">
          <h2 className="font-display text-xl text-fg">{t('research.paper.methodTitle')}</h2>
          <p className="mt-3 text-[15px] leading-8 text-fg-muted">{t('research.paper.methodBody')}</p>
        </section>
        <section className="border-b border-border py-6">
          <h2 className="font-display text-xl text-fg">{t('research.paper.pubTitle')}</h2>
          <p className="mt-3 text-[15px] leading-8 text-fg-muted">{item.description}</p>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-accent">
              {t('research.paper.readAtPublisher')}
            </a>
          ) : null}
        </section>
        <section className="py-6">
          <h2 className="font-display text-xl text-fg">{t('research.paper.relatedTitle')}</h2>
          <a href={relatedHref} className="mt-3 inline-block text-sm text-accent">
            City Courier →
          </a>
        </section>
      </article>
    </div>
  );
}
