import {render, screen} from '@testing-library/react';
import {NextIntlClientProvider} from 'next-intl';
import {describe, expect, it} from 'vitest';
import id from '../messages/id.json';
import {GuestbookEntryList} from '@/components/guestbook-entry-list';

describe('GuestbookEntryList', () => {
  it('renders DataEmpty when entries list is empty', () => {
    render(
      <NextIntlClientProvider locale="id" messages={id}>
        <GuestbookEntryList entries={[]} locale="id" />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole('heading', {level: 2, name: id.guestbook.emptyTitle})).toBeInTheDocument();
    expect(screen.getByText(id.guestbook.empty)).toBeInTheDocument();
  });

  it('renders entries with name, date, message, and safe external link', () => {
    const entries = [
      {
        id: 1,
        name: 'Rin Tohsaka',
        message: 'Keren karyanya!',
        website: 'https://example.com',
        createdAt: '2026-10-01T12:00:00Z'
      }
    ];

    render(
      <NextIntlClientProvider locale="id" messages={id}>
        <GuestbookEntryList entries={entries} locale="id" />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Rin Tohsaka')).toBeInTheDocument();
    expect(screen.getByText('Keren karyanya!')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders admin reply when present on entry', () => {
    const entries = [
      {
        id: 2,
        name: 'Sakura',
        message: 'Keren!',
        createdAt: '2026-10-02T12:00:00Z',
        adminReply: 'Terima kasih banyak Sakura!',
        repliedAt: '2026-10-02T13:00:00Z'
      }
    ];

    render(
      <NextIntlClientProvider locale="id" messages={id}>
        <GuestbookEntryList entries={entries} locale="id" />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Balasan dari Ferry')).toBeInTheDocument();
    expect(screen.getByText('Terima kasih banyak Sakura!')).toBeInTheDocument();
  });
});
