/** @vitest-environment node */
import {describe, expect, it} from 'vitest';
import {createTestBucket} from './r2';

describe('createTestBucket', () => {
  it('provisions a local R2 binding that supports put/get/delete', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      await bucket.put('test-key.txt', 'hello');
      const got = await bucket.get('test-key.txt');
      expect(got).not.toBeNull();
      expect(await got?.text()).toBe('hello');
      await bucket.delete('test-key.txt');
      expect(await bucket.get('test-key.txt')).toBeNull();
    } finally {
      await dispose();
    }
  });
});
