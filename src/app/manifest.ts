import type {MetadataRoute} from 'next';
import {siteName} from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'Ferry AP',
    description:
      'Portfolio of Ferry Andhika Pratama — software built from direct experience in teaching, writing, and security research.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0B',
    theme_color: '#0A0A0B',
    icons: [
      {src: '/icon.svg', sizes: 'any', type: 'image/svg+xml'},
      {src: '/apple-icon.png', sizes: '180x180', type: 'image/png'},
      {src: '/favicon.ico', sizes: 'any', type: 'image/x-icon'}
    ]
  };
}
