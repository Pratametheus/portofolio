import Image from 'next/image';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ContactRow} from '@/components/contact-row';
import {ImageCard} from '@/components/image-card';
import {PillarCard} from '@/components/pillar-card';
import {ResearchCard} from '@/components/research-card';
import {Reveal, Stagger} from '@/components/motion/reveal';
import {ScrollSpin} from '@/components/motion/scroll-spin.lazy';
import {MagneticButton} from '@/components/motion/magnetic-button.lazy';
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
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-0 lg:py-12">
      <header className="grid items-center gap-8 border-b border-border pb-10 sm:grid-cols-[1fr_160px]">
        <Stagger className="max-w-2xl">
          <Reveal>
            <p className="text-base text-fg-muted">{sidebar('role')}</p>
          </Reveal>
          <Reveal>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
              Ferry Andhika Pratama
            </h1>
          </Reveal>
          <Reveal>
            <p className="mt-8 max-w-lg text-xl leading-8 text-fg sm:text-2xl">{t('tagline')}</p>
          </Reveal>
          <Reveal>
            <a href="#selected-work-heading" className="mt-6 inline-block border-b border-accent pb-1 text-lg text-accent transition-colors hover:text-fg">{t('selectedWork')}</a>
          </Reveal>
        </Stagger>
        <figure className="relative h-48 overflow-hidden rounded-lg bg-surface sm:h-56">
          <ScrollSpin className="absolute inset-0">
            <Image
              data-hero="night"
              src="/hero/operator-night.webp"
              alt={t('heroAlt')}
              fill
              sizes="(min-width:1024px) 420px, 100vw"
              priority
              className="object-cover object-center"
            />
            <Image
              data-hero="light"
              src="/hero/operator-light.webp"
              alt={t('heroAlt')}
              fill
              sizes="(min-width:1024px) 420px, 100vw"
              priority
              className="object-cover object-center"
            />
          </ScrollSpin>
        </figure>
      </header>

      <section aria-labelledby="pillars-heading" className="mt-10">
        <Reveal>
          <h2 id="pillars-heading" className="font-display text-3xl text-fg">
            {t('pillarsTitle')}
          </h2>
        </Reveal>
        <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
          <Reveal>
            <PillarCard icon="build" title={t('pillars.build.title')} body={t('pillars.build.body')} />
          </Reveal>
          <Reveal>
            <PillarCard icon="teach" title={t('pillars.teach.title')} body={t('pillars.teach.body')} />
          </Reveal>
          <Reveal>
            <PillarCard icon="secure" title={t('pillars.secure.title')} body={t('pillars.secure.body')} />
          </Reveal>
        </Stagger>
      </section>

      <section aria-labelledby="selected-work-heading" className="mt-20">
        <Reveal>
          <h2 id="selected-work-heading" className="font-display text-3xl text-fg">
            {t('selectedWork')}
          </h2>
        </Reveal>
        <Stagger className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {caseStudies.map((caseStudy, index) => (
            <Reveal key={caseStudy.slug}>
              <ImageCard caseStudy={caseStudy} locale={locale} priority={index === 0} />
            </Reveal>
          ))}
        </Stagger>
      </section>

      <section aria-labelledby="research-heading" className="mt-20">
        <Reveal>
          <h2 id="research-heading" className="font-display text-3xl text-fg">
            {t('researchTitle')}
          </h2>
          <div className="mt-8">
            <ResearchCard locale={locale} />
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="contact-heading" className="mt-20">
        <Reveal>
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
          <MagneticButton
            href={contactHref}
            className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 font-medium text-on-accent"
          >
            {t('contactCta')}
          </MagneticButton>
        </Reveal>
      </section>
    </main>
  );
}
