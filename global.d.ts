import type {Locale} from '@/i18n/routing';
import type messages from './messages/id.json';

// Typed `t()` message keys, checked by `tsc`. `id.json` and `en.json` are
// kept in lockstep by `tests/messages.test.ts` (key parity), so either file
// works as the canonical shape here.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
