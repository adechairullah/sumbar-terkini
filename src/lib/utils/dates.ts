/**
 * Date formatting utilities for dynamic slot and announcement texts
 */

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function getDynamicMonthYear(): { month: string; year: number; date: number } {
  const now = new Date();
  return {
    month: INDONESIAN_MONTHS[now.getMonth()] || 'November',
    year: now.getFullYear(),
    date: now.getDate(),
  };
}

export function getDynamicSlotText(): string {
  const { month, year } = getDynamicMonthYear();
  return `Slot Iklan Terbuka untuk ${month} ${year}`;
}

export function getDynamicAnnouncementText(followersBadge = '330.200+ Total Followers Aktif'): string {
  const { month, year } = getDynamicMonthYear();
  return `${followersBadge} Lintas Ranah Minang & Nasional | Slot ${month} ${year} Dibuka`;
}
