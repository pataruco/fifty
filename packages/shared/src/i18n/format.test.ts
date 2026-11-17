import { describe, expect, test } from 'vitest';
import { plainDate } from '../time/plain-date.ts';
import {
  capitalise,
  formatDate,
  formatDateRange,
  formatDistance,
  kmToMiles,
  NBSP,
} from './format.ts';

const may = (day: number) =>
  plainDate(`2028-05-${String(day).padStart(2, '0')}`);
const full = { weekday: true, year: false };

describe('format', () => {
  test.each([
    [7, 14, 'Sunday 7 to Sunday 14 May', 'del domingo 7 al domingo 14 de mayo'],
    [
      15,
      17,
      'Monday 15 to Wednesday 17 May',
      'del lunes 15 al miércoles 17 de mayo',
    ],
    [
      18,
      23,
      'Thursday 18 to Tuesday 23 May',
      'del jueves 18 al martes 23 de mayo',
    ],
    [
      24,
      27,
      'Wednesday 24 to Saturday 27 May',
      'del miércoles 24 al sábado 27 de mayo',
    ],
  ])('canvas dates in both languages: %i to %i May', (from, to, en, es) => {
    expect(formatDateRange(may(from), may(to), 'en', full)).toBe(en);
    expect(formatDateRange(may(from), may(to), 'es', full)).toBe(es);
  });

  test('canvas dates in both languages: the whole walk and one day', () => {
    const o = { weekday: false, year: true };

    expect(formatDateRange(may(7), may(28), 'en', o)).toBe('7 to 28 May 2028');
    expect(formatDateRange(may(7), may(28), 'es', o)).toBe(
      'del 7 al 28 de mayo de 2028',
    );

    const day = { weekday: true, year: true };

    expect(formatDate(may(12), 'en', day)).toBe('Friday 12 May 2028');
    expect(formatDate(may(12), 'es', day)).toBe('viernes 12 de mayo de 2028');
    expect(formatDate(may(12), 'en', full)).toBe('Friday 12 May');
    expect(formatDate(may(12), 'es', full)).toBe('viernes 12 de mayo');
  });

  test('a range across two months names both', () => {
    const a = plainDate('2028-04-30');

    expect(formatDateRange(a, may(7), 'en', full)).toBe(
      'Sunday 30 April to Sunday 7 May',
    );
    expect(formatDateRange(a, may(7), 'es', full)).toBe(
      'del domingo 30 de abril al domingo 7 de mayo',
    );
  });

  test('miles are computed and joined with NBSP', () => {
    expect([110, 115, 90, 13, 315].map(kmToMiles)).toEqual([
      68, 71, 56, 8, 196,
    ]);
    expect(NBSP).toBe(' ');
    expect(formatDistance(110, 'en')).toBe(`110${NBSP}km (68${NBSP}miles)`);
    expect(formatDistance(110, 'es')).toBe(`110${NBSP}km`);
    expect(formatDistance(2, 'en')).toBe(`2${NBSP}km (1${NBSP}mile)`);
  });

  test('capitalise upper-cases only the first letter', () => {
    expect(capitalise('viernes 12 de mayo')).toBe('Viernes 12 de mayo');
    expect(capitalise('')).toBe('');
  });
});
