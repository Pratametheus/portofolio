import path from 'node:path';
import {getPlatformProxy} from 'wrangler';

export async function createTestBucket(): Promise<{
  bucket: R2Bucket;
  dispose: () => Promise<void>;
}> {
  const proxy = await getPlatformProxy<CloudflareEnv>({
    configPath: path.resolve(import.meta.dirname, '../../wrangler.jsonc'),
    persist: false
  });
  const bucket = proxy.env.UPLOADS;
  if (!bucket) {
    throw new Error('R2 binding "UPLOADS" not found — check wrangler.jsonc r2_buckets config');
  }
  return {bucket, dispose: proxy.dispose};
}
