'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';

export function ContactDraftForm() {
  const t = useTranslations();
  const [status, setStatus] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '');
    const email = String(data.get('email') ?? '');
    const message = String(data.get('message') ?? '');
    try {
      await navigator.clipboard.writeText(`${t('contact.form.from')}: ${name} <${email}>\n\n${message}`);
      setStatus(t('contact.form.statusOk'));
    } catch {
      setStatus(t('contact.form.statusFail'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-fg-muted">
          <span>{t('contact.form.name')}</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
          />
        </label>
        <label className="text-sm text-fg-muted">
          <span>{t('contact.form.email')}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
          />
        </label>
      </div>
      <label className="text-sm text-fg-muted">
        <span>{t('contact.form.message')}</span>
        <textarea
          name="message"
          rows={5}
          required
          className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
        />
      </label>
      <button
        type="submit"
        className="min-h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent"
      >
        {t('contact.form.submit')}
      </button>
      <p role="status" className="text-sm text-fg-muted">
        {status}
      </p>
    </form>
  );
}
