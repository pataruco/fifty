// Dates and distances in words. Fixed tables instead of the platform's
// locale data, so Node and workerd give the same bytes whatever ICU each
// one ships.

import { type PlainDate, weekday } from '../time/plain-date.ts';
import type { Lang } from './lang.ts';

/** Joins a number to its unit so a line never breaks between them. */
export const NBSP = ' ';

export interface DateOptions {
  readonly weekday: boolean;
  readonly year: boolean;
}

const WEEKDAYS: Readonly<Record<Lang, readonly string[]>> = {
  en: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  es: [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ],
};

const MONTHS: Readonly<Record<Lang, readonly string[]>> = {
  en: [
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
  ],
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
};

const weekdayName = (d: PlainDate, lang: Lang) =>
  WEEKDAYS[lang][weekday(d)] as string;
const monthName = (d: PlainDate, lang: Lang) =>
  MONTHS[lang][d.month - 1] as string;

/** "Friday 12" or "viernes 12": the day without its month. */
function dayPart(d: PlainDate, lang: Lang, o: DateOptions): string {
  return o.weekday ? `${weekdayName(d, lang)} ${d.day}` : String(d.day);
}

/** " May 2028" or " de mayo de 2028": what follows the day. */
function monthPart(
  d: PlainDate,
  lang: Lang,
  o: { readonly year: boolean },
): string {
  if (lang === 'es') {
    return ` de ${monthName(d, lang)}${o.year ? ` de ${d.year}` : ''}`;
  }
  return ` ${monthName(d, lang)}${o.year ? ` ${d.year}` : ''}`;
}

/** "Friday 12 May 2028" or "viernes 12 de mayo de 2028". */
export function formatDate(d: PlainDate, lang: Lang, o: DateOptions): string {
  return `${dayPart(d, lang, o)}${monthPart(d, lang, o)}`;
}

/**
 * "Sunday 7 to Sunday 14 May" or "del domingo 7 al domingo 14 de mayo".
 * The month and year are written once when both ends share them.
 */
export function formatDateRange(
  a: PlainDate,
  b: PlainDate,
  lang: Lang,
  o: DateOptions,
): string {
  const sameYear = a.year === b.year;
  const sameMonth = sameYear && a.month === b.month;
  const start = sameMonth
    ? dayPart(a, lang, o)
    : `${dayPart(a, lang, o)}${monthPart(a, lang, { year: o.year && !sameYear })}`;
  const end = formatDate(b, lang, o);
  return lang === 'es' ? `del ${start} al ${end}` : `${start} to ${end}`;
}

export function kmToMiles(km: number): number {
  return Math.round(km / 1.609344);
}

/** "110 km (68 miles)" in English, "110 km" in Spanish, joined by NBSP. */
export function formatDistance(km: number, lang: Lang): string {
  const metric = `${km}${NBSP}km`;
  if (lang === 'es') return metric;
  const miles = kmToMiles(km);
  return `${metric} (${miles}${NBSP}${miles === 1 ? 'mile' : 'miles'})`;
}

export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
