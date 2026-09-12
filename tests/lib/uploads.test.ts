import {describe, expect, it} from 'vitest';
import {
  validateUploadedFile,
  buildUploadKey,
  uploadUrl,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES
} from '@/lib/uploads';

function fakeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], 'test-upload', {type});
}

describe('validateUploadedFile', () => {
  it('accepts every allowed type under the size limit', () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      expect(() => validateUploadedFile(fakeFile(type, 1024))).not.toThrow();
    }
  });

  it('rejects a disallowed content type', () => {
    expect(() => validateUploadedFile(fakeFile('text/plain', 1024))).toThrow(/must be one of/);
  });

  it('rejects a file over the size limit', () => {
    expect(() => validateUploadedFile(fakeFile('image/png', MAX_UPLOAD_BYTES + 1))).toThrow(/smaller/);
  });

  it('accepts a file exactly at the size limit', () => {
    expect(() => validateUploadedFile(fakeFile('image/png', MAX_UPLOAD_BYTES))).not.toThrow();
  });
});

describe('buildUploadKey', () => {
  it('builds a key under the given prefix with the right extension per content type', () => {
    expect(buildUploadKey('career-logos', 'image/png')).toMatch(/^career-logos\/[\w-]+\.png$/);
    expect(buildUploadKey('career-logos', 'image/jpeg')).toMatch(/^career-logos\/[\w-]+\.jpg$/);
    expect(buildUploadKey('achievement-covers', 'image/webp')).toMatch(/^achievement-covers\/[\w-]+\.webp$/);
  });

  it('generates a different key on every call', () => {
    const a = buildUploadKey('career-logos', 'image/png');
    const b = buildUploadKey('career-logos', 'image/png');
    expect(a).not.toBe(b);
  });
});

describe('uploadUrl', () => {
  it('joins the public base URL and the key', () => {
    const url = uploadUrl('career-logos/abc.png');
    expect(url.endsWith('/career-logos/abc.png')).toBe(true);
    expect(url.startsWith('http')).toBe(true);
  });
});
