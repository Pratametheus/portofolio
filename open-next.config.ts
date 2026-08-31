import {defineCloudflareConfig} from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Portfolio content is generated at build time. This read-only cache does not
// require R2; switch cache backends before adding ISR or on-demand revalidation.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true
});
