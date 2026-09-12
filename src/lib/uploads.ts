// Served through a custom domain on the R2 bucket (rather than the raw r2.dev
// subdomain) so it sits in the zone and can carry a rate-limiting rule — see the
// plan's "After Task 8 — manual steps" section.
export const UPLOADS_PUBLIC_BASE_URL = 'https://uploads.ferryandhikapratama.com';

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function validateUploadedFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error(`File must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File must be ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB or smaller`);
  }
}

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

export function buildUploadKey(prefix: string, contentType: string): string {
  return `${prefix}/${crypto.randomUUID()}.${extensionForContentType(contentType)}`;
}

export function uploadUrl(key: string): string {
  return `${UPLOADS_PUBLIC_BASE_URL}/${key}`;
}
