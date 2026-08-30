import {describe, expect, it} from 'vitest';
import {getPathname} from '@/i18n/navigation';

describe('getPathname', () => {
  it('localises a static route to English', () => {
    expect(getPathname({href: '/karya', locale: 'en'})).toBe('/en/work');
  });
  it('localises a dynamic case-study route', () => {
    expect(
      getPathname({href: {pathname: '/karya/[slug]', params: {slug: 'city-courier'}}, locale: 'en'})
    ).toBe('/en/work/city-courier');
  });
});
