import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));
import {ContactDraftForm} from '@/components/contact-draft-form';

describe('ContactDraftForm', () => {
  it('copies a formatted draft to the clipboard and never fetches', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    // user-event's setup() installs its own navigator.clipboard stub (for
    // user.copy()/paste()), overwriting anything assigned beforehand. Define
    // our mock after setup() so it is the one the component actually calls.
    Object.defineProperty(navigator, 'clipboard', {value: {writeText}, configurable: true});
    render(<ContactDraftForm />);
    await user.type(screen.getByLabelText('contact.form.name'), 'Rin');
    await user.type(screen.getByLabelText('contact.form.email'), 'rin@example.com');
    await user.type(screen.getByLabelText('contact.form.message'), 'Halo');
    await user.click(screen.getByRole('button', {name: 'contact.form.submit'}));
    expect(writeText).toHaveBeenCalledWith('Dari: Rin <rin@example.com>\n\nHalo');
    expect(screen.getByRole('status')).toHaveTextContent('contact.form.statusOk');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reports a clipboard failure without throwing', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText: vi.fn().mockRejectedValue(new Error('no'))},
      configurable: true
    });
    render(<ContactDraftForm />);
    await user.type(screen.getByLabelText('contact.form.name'), 'A');
    await user.type(screen.getByLabelText('contact.form.email'), 'a@b.co');
    await user.type(screen.getByLabelText('contact.form.message'), 'x');
    await user.click(screen.getByRole('button', {name: 'contact.form.submit'}));
    expect(screen.getByRole('status')).toHaveTextContent('contact.form.statusFail');
  });
});
