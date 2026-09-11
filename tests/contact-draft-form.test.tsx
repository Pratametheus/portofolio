import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {NextIntlClientProvider} from 'next-intl';
import {describe, expect, it, vi} from 'vitest';
import id from '../messages/id.json';
import en from '../messages/en.json';
import {ContactDraftForm} from '@/components/contact-draft-form';

describe('ContactDraftForm', () => {
  it.each([
    {locale: 'id', messages: id, name: 'Nama', message: 'Pesan', submit: 'Salin draf pesan', expected: 'Dari: Rin <rin@example.com>\n\nHalo'},
    {locale: 'en', messages: en, name: 'Name', message: 'Message', submit: 'Copy message draft', expected: 'From: Rin <rin@example.com>\n\nHalo'}
  ] as const)('copies a localized $locale draft without sending it', async (fixture) => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    // setup installs its own clipboard getter; replace it at the browser boundary.
    Object.defineProperty(navigator, 'clipboard', {value: {writeText}, configurable: true});
    render(
      <NextIntlClientProvider locale={fixture.locale} messages={fixture.messages}>
        <ContactDraftForm />
      </NextIntlClientProvider>
    );
    await user.type(screen.getByLabelText(fixture.name), 'Rin');
    await user.type(screen.getByLabelText('Email'), 'rin@example.com');
    await user.type(screen.getByLabelText(fixture.message), 'Halo');
    await user.click(screen.getByRole('button', {name: fixture.submit}));
    expect(writeText).toHaveBeenCalledWith(fixture.expected);
    expect(screen.getByRole('status')).toHaveTextContent(fixture.messages.contact.form.statusOk);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reports clipboard denial while preserving the draft fields', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText: vi.fn().mockRejectedValue(new Error('no'))},
      configurable: true
    });
    render(<NextIntlClientProvider locale="en" messages={en}><ContactDraftForm /></NextIntlClientProvider>);
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.type(screen.getByLabelText('Email'), 'a@b.co');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', {name: 'Copy message draft'}));
    expect(screen.getByRole('status')).toHaveTextContent('Clipboard blocked by the browser. Copy the message manually.');
    expect(screen.getByLabelText('Message')).toHaveValue('Hello');
  });
});
