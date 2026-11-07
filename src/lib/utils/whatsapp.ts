import { EndorsePackage } from '@/types';
import { calculateDiscountTier, formatIDR } from './formatters';

/**
 * WhatsApp Phone Number Normalizer
 * Converts local Indonesian numbers (08xxx) and international (+62xxx, 62xxx),
 * stripping non-digit characters.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Pre-formatted WhatsApp Order URL Generator
 */
export function generateWhatsAppUrl(params: {
  phone: string;
  template?: string;
  selectedPackages: EndorsePackage[];
  creatorName?: string;
  isPrivateQuote?: boolean;
}): string {
  const cleanPhone = normalizePhoneNumber(params.phone || '6281234567890');
  const creator = params.creatorName || 'Sumbar Terkini';
  const calculation = calculateDiscountTier(params.selectedPackages);

  const deliverablesLines = params.selectedPackages
    .map((pkg, idx) => {
      const priceText = pkg.is_price_hidden || params.isPrivateQuote
        ? 'Negosiasi Khusus'
        : formatIDR(pkg.price);
      return `${idx + 1}. *${pkg.name}* (${priceText})`;
    })
    .join('\n');

  let messageText = `Halo Admin *${creator}*! 👋\n\n`;
  messageText += `Saya tertarik untuk melakukan booking endorsement media kit dengan rincian berikut:\n\n`;
  messageText += `📦 *Paket Deliverable:*\n${deliverablesLines || '- Belum memilih paket'}\n\n`;

  if (params.selectedPackages.length > 0) {
    messageText += `🏷️ *Tier:* ${calculation.tierName}\n`;
    if (!params.isPrivateQuote && calculation.discountPercent > 0) {
      messageText += `✨ *Diskon:* ${calculation.discountPercent}% (-${formatIDR(calculation.discountAmount)})\n`;
    }
    if (params.isPrivateQuote || calculation.hasHiddenPrice) {
      if (params.isPrivateQuote) {
        messageText += `💰 *Estimasi Total:* Penawaran Negosiasi Khusus\n\n`;
      } else {
        messageText += `💰 *Estimasi Total:* ${formatIDR(calculation.total)} (+ Paket Negosiasi Khusus)\n\n`;
      }
    } else {
      messageText += `💰 *Total Investasi:* ${formatIDR(calculation.total)}\n\n`;
    }
  }

  messageText += `Mohon info ketersediaan slot jadwal dan tahapan selanjutnya. Terima kasih!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

