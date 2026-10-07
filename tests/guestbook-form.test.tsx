import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {NextIntlClientProvider} from 'next-intl';
import {describe, expect, it, vi} from 'vitest';
import id from '../messages/id.json';
import {GuestbookForm} from '@/components/guestbook-form';

const mockSubmit = vi.fn();
vi.mock('@/lib/actions/guestbook', () => ({
  submitGuestbookEntryAction: (...args: any[]) => mockSubmit(...args)
}));

describe('GuestbookForm', () => {
  it('renders visible labels, updates char count, and handles submission', async () => {
    mockSubmit.mockResolvedValue({success: true});
    const user = userEvent.setup();

    render(
      <NextIntlClientProvider locale="id" messages={id}>
        <GuestbookForm />
      </NextIntlClientProvider>
    );

    const nameInput = screen.getByLabelText('Nama');
    const websiteInput = screen.getByLabelText(/Situs/);
    const messageInput = screen.getByLabelText(/Pesan/);
    const submitBtn = screen.getByRole('button', {name: 'Kirim pesan'});

    expect(nameInput).toBeInTheDocument();
    expect(websiteInput).toBeInTheDocument();
    expect(messageInput).toBeInTheDocument();
    expect(screen.getByText('0/1000')).toBeInTheDocument();

    await user.type(nameInput, 'Ferry');
    await user.type(messageInput, 'Halo semua!');
    expect(screen.getByText('11/1000')).toBeInTheDocument();

    await user.click(submitBtn);
    expect(mockSubmit).toHaveBeenCalled();
    expect(await screen.findByRole('status')).toHaveTextContent(id.guestbook.form.success);
    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  it('renders field errors on failure', async () => {
    mockSubmit.mockResolvedValue({
      success: false,
      error: 'Formulir tidak valid.',
      fieldErrors: {name: 'Nama wajib diisi.'}
    });
    const user = userEvent.setup();

    render(
      <NextIntlClientProvider locale="id" messages={id}>
        <GuestbookForm />
      </NextIntlClientProvider>
    );

    await user.type(screen.getByLabelText('Nama'), 'Invalid User');
    await user.type(screen.getByLabelText(/Pesan/), 'Pesan yang dicoba');
    await user.click(screen.getByRole('button', {name: 'Kirim pesan'}));

    expect(await screen.findByRole('alert')).toHaveTextContent('Formulir tidak valid.');
    expect(screen.getByText('Nama wajib diisi.')).toBeInTheDocument();
  });
});
