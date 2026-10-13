export interface TelegramAlertInput {
  name: string;
  message: string;
  website?: string | null;
  botToken?: string;
  chatId?: string;
}

export async function sendGuestbookTelegramAlert(input: TelegramAlertInput): Promise<boolean> {
  const token = input.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = input.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return false;
  }

  const websiteLine = input.website ? `\n🌐 *Website:* ${input.website}` : '';
  const text = `📖 *Pesan Baru di Buku Tamu!*\n\n👤 *Nama:* ${input.name}${websiteLine}\n💬 *Pesan:*\n${input.message}\n\n🔗 Moderasi: https://ferryandhikapratama.com/admin/guestbook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to send Telegram guestbook alert:', error);
    return false;
  }
}
