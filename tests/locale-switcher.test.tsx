import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/karya',
  useRouter: () => ({replace})
}));
vi.mock('next-intl', () => ({useLocale: () => 'id'}));

import LocaleSwitcher from '@/components/locale-switcher';

describe('LocaleSwitcher', () => {
  it('marks the current locale and switches on the other, keeping the path', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);
    expect(screen.getByRole('button', {name: 'ID'})).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', {name: 'EN'}));
    expect(replace).toHaveBeenCalledWith('/karya', {locale: 'en'});
  });
});
