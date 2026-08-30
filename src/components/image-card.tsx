import Image from 'next/image';
import Link from 'next/link';
import {getPathname} from '@/i18n/navigation';
import type {CaseStudy, Locale} from '@/content/types';

type Props = {
  caseStudy: CaseStudy;
  locale: Locale;
  priority?: boolean;
};

export function ImageCard({caseStudy, locale, priority = false}: Props) {
  const detailHref = getPathname({
    locale,
    href: {pathname: '/karya/[slug]', params: {slug: caseStudy.slug}}
  });
  const visitLabel = locale === 'id' ? 'Kunjungi aplikasi' : 'Visit application';

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-[16/10] bg-surface-2">
        <Image
          src={caseStudy.thumbnail.src}
          alt={caseStudy.thumbnail.alt}
          fill
          sizes="(min-width:1024px) 360px, 100vw"
          priority={priority}
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl text-fg">
            <Link href={detailHref} className="transition-colors hover:text-accent">
              {caseStudy.title}
            </Link>
          </h2>
          <span className="font-mono text-xs text-fg-muted">{caseStudy.year}</span>
        </div>
        <p className="mt-3 text-fg-muted">{caseStudy.tagline}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {caseStudy.stack.map((tech) => (
            <li key={tech} className="font-mono text-xs text-fg-muted">
              {tech}
            </li>
          ))}
        </ul>
        {caseStudy.liveUrl ? (
          <a
            href={caseStudy.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block font-mono text-sm text-accent transition-colors hover:text-fg"
          >
            {visitLabel}
          </a>
        ) : null}
      </div>
    </article>
  );
}
