import { describe, expect, test } from 'vitest';
import {
  addDays,
  daysInclusive,
  plainDate,
  toIso,
  weekday,
} from './plain-date.ts';

describe('plain dates', () => {
  test('round-trip through ISO and refuse impossible dates', () => {
    expect(toIso(plainDate('2028-05-07'))).toBe('2028-05-07');
    for (const bad of ['2028-02-30', '2028-13-01', '2028-5-7', 'x', '']) {
      expect(() => plainDate(bad)).toThrow(TypeError);
    }
    expect(toIso(plainDate('2028-02-29'))).toBe('2028-02-29');
  });

  test('weekday, addDays and daysInclusive', () => {
    expect(weekday(plainDate('2028-05-07'))).toBe(0);
    expect(weekday(plainDate('2028-05-12'))).toBe(5);
    expect(toIso(addDays(plainDate('2028-05-28'), 4))).toBe('2028-06-01');
    expect(toIso(addDays(plainDate('2028-05-01'), -1))).toBe('2028-04-30');
    expect(
      daysInclusive(plainDate('2028-05-07'), plainDate('2028-05-28')),
    ).toBe(22);
  });
});
