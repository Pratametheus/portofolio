import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/site';

/**
 * AI-training and SEO crawlers that add heavy, low-value traffic to a personal
 * portfolio. On Cloudflare Workers Free plan every one of their hits invokes the
 * Worker and counts against the 100k/day cap, so the polite ones are turned away
 * here; the rest are handled by Cloudflare Bot Fight Mode + WAF rate limiting.
 */
export const BLOCKED_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
  'PerplexityBot',
  'AhrefsBot',
  'SemrushBot',
  'DataForSeoBot',
  'MJ12bot',
  'DotBot',
  'PetalBot',
  'ImagesiftBot',
  'Timpibot',
  'omgilibot',
  'Diffbot',
  'Scrapy'
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...BLOCKED_USER_AGENTS.map((userAgent) => ({userAgent, disallow: '/'})),
      {userAgent: '*', allow: '/'}
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
