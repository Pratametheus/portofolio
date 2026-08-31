import {ImageResponse} from 'next/og';
import {routing} from '@/i18n/routing';

// Lives under [locale] so the injected og:image tag resolves against the
// locale layout's metadataBase. Statically generated at build time (no
// request-time data) — OpenNext serves it as a plain asset.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const alt =
  'Ferry Andhika Pratama — Software Engineer and Computing Teacher';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0A0A0B',
          padding: 80,
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              backgroundColor: '#FACC15'
            }}
          />
          <div
            style={{
              color: '#9B9BA3',
              fontSize: 24,
              letterSpacing: 6,
              textTransform: 'uppercase'
            }}
          >
            Public Dossier
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
          <div
            style={{
              color: '#EDEDEF',
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05
            }}
          >
            Ferry Andhika Pratama
          </div>
          <div style={{color: '#FACC15', fontSize: 34}}>
            Software Engineer · Computing Teacher
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            color: '#9B9BA3',
            fontSize: 24
          }}
        >
          <div>ferryandhikapratama.com</div>
          <div>Build · Teach · Secure</div>
        </div>
      </div>
    ),
    {...size}
  );
}
