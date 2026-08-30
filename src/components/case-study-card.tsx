import {localizedPath} from '@/i18n/paths';
import type {CaseStudy, Locale} from '@/content/types';

type Props = {
  caseStudy: CaseStudy;
  locale: Locale;
};

export function CaseStudyCard({caseStudy, locale}: Props) {
  const visitLabel = locale === 'id' ? 'Kunjungi aplikasi' : 'Visit application';

  return (
    <article className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl text-fg">
          <a
            href={localizedPath(locale, `/work/${caseStudy.slug}`)}
            className="transition-colors hover:text-accent"
          >
            {caseStudy.title}
          </a>
        </h3>
        <span className="font-mono text-sm text-fg-muted">{caseStudy.year}</span>
      </div>
      {caseStudy.scope ? (
        <p className="mb-3 font-mono text-xs text-accent">{caseStudy.scope}</p>
      ) : null}
      <p className="mb-4 text-fg-muted">{caseStudy.tagline}</p>
      <ul className="flex flex-wrap gap-2">
        {caseStudy.stack.map((tech) => (
          <li key={tech} className="font-mono text-xs text-fg-muted">
            {tech}
          </li>
        ))}
      </ul>
      {caseStudy.liveUrl || caseStudy.repositoryNote ? (
        <div className="mt-5 border-t border-border pt-4">
          {caseStudy.liveUrl ? (
            <a
              href={caseStudy.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-accent transition-colors hover:text-fg"
            >
              {visitLabel}
            </a>
          ) : null}
          {caseStudy.repositoryNote ? (
            <p className="mt-2 text-sm text-fg-muted">{caseStudy.repositoryNote}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
