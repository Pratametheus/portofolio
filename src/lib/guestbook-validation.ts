export type GuestbookValidationResult = {
  data?: {
    name: string;
    message: string;
    website?: string | null;
  };
  fieldErrors?: {
    name?: string;
    message?: string;
    website?: string;
  };
  isHoneypot?: boolean;
};

export function validateGuestbookInput(formData: FormData): GuestbookValidationResult {
  // Honeypot check for bots
  const honeypot = formData.get('company_url_hp');
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return {isHoneypot: true};
  }

  const fieldErrors: {name?: string; message?: string; website?: string} = {};

  const rawName = formData.get('name');
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  if (!name || name.length < 1 || name.length > 50) {
    fieldErrors.name = 'Nama harus antara 1 sampai 50 karakter.';
  }

  const rawMessage = formData.get('message');
  const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';
  if (!message || message.length < 3 || message.length > 1000) {
    fieldErrors.message = 'Pesan harus antara 3 sampai 1000 karakter.';
  }

  const rawWebsite = formData.get('website');
  let website: string | null = null;
  if (typeof rawWebsite === 'string' && rawWebsite.trim().length > 0) {
    const trimmedWebsite = rawWebsite.trim();
    if (trimmedWebsite.length > 150) {
      fieldErrors.website = 'URL situs tidak boleh lebih dari 150 karakter.';
    } else {
      try {
        const parsed = new URL(trimmedWebsite);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          fieldErrors.website = 'URL situs harus diawali dengan http:// atau https://';
        } else {
          website = trimmedWebsite;
        }
      } catch {
        fieldErrors.website = 'Format URL situs tidak valid.';
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {fieldErrors};
  }

  return {data: {name, message, website}};
}
