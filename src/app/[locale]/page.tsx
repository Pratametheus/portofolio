import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ContactRow} from '@/components/contact-row';
import {ImageCard} from '@/components/image-card';
import {PillarCard} from '@/components/pillar-card';
import {ResearchCard} from '@/components/research-card';
import {getPathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested;
  setRequestLocale(locale);

  const [t, sidebar, contact] = await Promise.all([
    getTranslations({locale, namespace: 'home'}),
    getTranslations({locale, namespace: 'sidebar'}),
    getTranslations({locale, namespace: 'contact'})
  ]);
  const caseStudies = getAllCaseStudies(locale);
  const contactHref = getPathname({locale, href: '/kontak'});

  return (
    <main className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
      <header className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-accent">{t('eyebrow')}</p>
          <h1 className="mt-6 font-display text-5xl leading-tight text-fg sm:text-6xl">
            Ferry Andhika Pratama
          </h1>
          <p className="mt-4 font-mono text-sm text-accent">{sidebar('role')}</p>
          <p className="mt-8 text-2xl leading-9 text-fg">{t('tagline')}</p>
          <p className="mt-4 leading-7 text-fg-muted">{t('statement')}</p>
        </div>
        <figure className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface">
          <Image
            data-hero="night"
            src="/hero/operator-night.webp"
            alt={t('heroAlt')}
            fill
            sizes="(min-width:1024px) 420px, 100vw"
            priority
            className="object-cover object-[center_20%]"
          />
          <Image
            data-hero="light"
            src="/hero/operator-light.webp"
            alt={t('heroAlt')}
            fill
            sizes="(min-width:1024px) 420px, 100vw"
            priority
            className="object-cover object-[center_22%]"
          />
        </figure>
      </header>

      <section aria-labelledby="pillars-heading" className="mt-20">
        <h2 id="pillars-heading" className="font-display text-3xl text-fg">
          {t('pillarsTitle')}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <PillarCard
            icon="build"
            title={t('pillars.build.title')}
            body={t('pillars.build.body')}
          />
          <PillarCard
            icon="teach"
            title={t('pillars.teach.title')}
            body={t('pillars.teach.body')}
          />
          <PillarCard
            icon="secure"
            title={t('pillars.secure.title')}
            body={t('pillars.secure.body')}
          />
        </div>
      </section>

      <section aria-labelledby="selected-work-heading" className="mt-20">
        <h2 id="selected-work-heading" className="font-display text-3xl text-fg">
          {t('selectedWork')}
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {caseStudies.map((caseStudy, index) => (
            <ImageCard
              key={caseStudy.slug}
              caseStudy={caseStudy}
              locale={locale}
              priority={index === 0}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="research-heading" className="mt-20">
        <h2 id="research-heading" className="font-display text-3xl text-fg">
          {t('researchTitle')}
        </h2>
        <div className="mt-8">
          <ResearchCard locale={locale} />
        </div>
      </section>

      <section aria-labelledby="contact-heading" className="mt-20">
        <h2 id="contact-heading" className="max-w-3xl font-display text-3xl text-fg">
          {t('contactTitle')}
        </h2>
        <div className="mt-8 rounded-xl border border-border bg-surface px-6">
          <ContactRow label={contact('emailLabel')} value={contact('emailValue')} />
          <ContactRow
            label={contact('githubLabel')}
            value={contact('githubValue')}
            href="https://github.com/Pratametheus"
          />
        </div>
        <Link
          href={contactHref}
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 font-medium text-on-accent"
        >
          {t('contactCta')}
        </Link>
      </section>
    </main>
  );
}
