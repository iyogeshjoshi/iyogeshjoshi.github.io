/** Effective / last-updated date shared by the privacy policy and terms (ISO). */
export const LEGAL_LAST_UPDATED = '2026-11-11';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * Formats a `YYYY-MM-DD` date as e.g. "11 November 2026". Pure string work,
 * so server and client output match regardless of locale or time zone.
 */
export function formatIsoDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  return name ? `${Number(day)} ${name} ${year}` : iso;
}
