'use client';

import {useState, useTransition, useRef} from 'react';
import {useTranslations} from 'next-intl';
import {submitGuestbookEntryAction, type GuestbookActionState} from '@/lib/actions/guestbook';

export function GuestbookForm() {
  const t = useTranslations('guestbook');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<GuestbookActionState | null>(null);
  const [charCount, setCharCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await submitGuestbookEntryAction({}, formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
        setCharCount(0);
      }
    });
  }

  return (
    <div className="mb-10 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-display text-base font-semibold text-fg">
        {t('form.heading')}
      </h2>

      {result?.success ? (
        <div
          role="status"
          className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-400"
        >
          {t('form.success')}
        </div>
      ) : null}

      {result?.error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {result.error}
        </div>
      ) : null}

      <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Honeypot field - visually hidden, trapped for bots */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="company_url_hp">Leave this empty</label>
          <input
            id="company_url_hp"
            type="text"
            name="company_url_hp"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-fg-muted">
            <span>{t('form.nameLabel')}</span>
            <input
              type="text"
              name="name"
              required
              maxLength={50}
              placeholder={t('form.namePlaceholder')}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg transition-colors focus:border-accent focus:outline-none"
            />
            {result?.fieldErrors?.name ? (
              <span className="mt-1 block text-xs text-red-400">
                {result.fieldErrors.name}
              </span>
            ) : null}
          </label>

          <label className="block text-sm text-fg-muted">
            <span>{t('form.websiteLabel')}</span>
            <input
              type="url"
              name="website"
              maxLength={150}
              placeholder={t('form.websitePlaceholder')}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg transition-colors focus:border-accent focus:outline-none"
            />
            {result?.fieldErrors?.website ? (
              <span className="mt-1 block text-xs text-red-400">
                {result.fieldErrors.website}
              </span>
            ) : null}
          </label>
        </div>

        <label className="block text-sm text-fg-muted">
          <div className="flex items-center justify-between">
            <span>{t('form.messageLabel')}</span>
            <span className="text-xs text-fg-muted">{charCount}/1000</span>
          </div>
          <textarea
            name="message"
            required
            rows={4}
            maxLength={1000}
            onChange={(e) => setCharCount(e.target.value.length)}
            placeholder={t('form.messagePlaceholder')}
            className="mt-1.5 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg transition-colors focus:border-accent focus:outline-none"
          />
          {result?.fieldErrors?.message ? (
            <span className="mt-1 block text-xs text-red-400">
              {result.fieldErrors.message}
            </span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? t('form.submitting') : t('form.submit')}
        </button>
      </form>
    </div>
  );
}
