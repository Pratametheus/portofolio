import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';

vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));
import {SocialCard} from '@/components/social-card';

describe('SocialCard', () => {
  it('renders the github variant as a link to the profile', () => {
    render(<SocialCard variant="github" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com/Pratametheus');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('heading', {name: 'contact.github.title'})).toBeInTheDocument();
    expect(screen.getByText('contact.github.body')).toBeInTheDocument();
    expect(screen.getByText('contact.github.cta ↗')).toBeInTheDocument();
  });

  it('renders the email variant as a non-interactive card', () => {
    render(<SocialCard variant="email" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'contact.email.title'})).toBeInTheDocument();
    expect(screen.getByText('contact.email.body')).toBeInTheDocument();
    expect(screen.getByText('contact.email.status')).toBeInTheDocument();
  });
});
