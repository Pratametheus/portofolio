import type {ReactNode} from 'react';

export type IconName =
  | 'build'
  | 'teach'
  | 'secure'
  | 'home'
  | 'about'
  | 'work'
  | 'research'
  | 'achievements'
  | 'guestbook'
  | 'contact'
  | 'links'
  | 'sun'
  | 'moon';

const ICON_PATHS: Record<IconName, ReactNode> = {
  build: (
    <>
      <path d="M8 5 L2.5 12 L8 19" />
      <path d="M16 5 L21.5 12 L16 19" />
      <path d="M13.75 3.5 L10.25 20.5" />
    </>
  ),
  teach: (
    <>
      <rect x="2.5" y="3.5" width="19" height="12.5" rx="1.5" />
      <path d="M8.5 20.5 L12 16 L15.5 20.5" />
      <path d="M6.5 7.5 H14" />
      <path d="M6.5 10.5 H12" />
      <path d="M6.5 13 H10" />
    </>
  ),
  secure: (
    <>
      <path d="M20 12 A8 8 0 1 1 16.5 5.4" />
      <path d="M20 4.5 L20 8.5 L16 8.5" />
      <circle cx="9.5" cy="13.5" r="2.6" />
      <path d="M11.7 12.2 L17 8.9" />
      <path d="M15 10.1 L16.4 12.3" />
      <path d="M13.1 11.3 L14.4 13.4" />
    </>
  ),
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v10h13V10" />
      <path d="M9.5 20v-6h5v6" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6" />
    </>
  ),
  work: (
    <>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M8 6V4h8v2M3 11h18M10 11v2h4v-2" />
    </>
  ),
  research: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M8 8h5M8 11h4" />
    </>
  ),
  achievements: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
      <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 20h8M9 17h6" />
    </>
  ),
  guestbook: (
    <>
      <path d="M5 3.5h12a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2Z" />
      <path d="M7 3.5v16M10 8h6M10 12h6" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  links: (
    <>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M7.5 17.5H6a4 4 0 0 1 0-8h4M16.5 6.5H18a4 4 0 0 1 0 8h-4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
};

export function Icon({name, className}: {name: IconName; className?: string}) {
  const paths = ICON_PATHS[name];
  if (!paths) return null;

  return (
    <svg
      aria-hidden="true"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}
