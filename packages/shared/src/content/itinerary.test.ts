import { describe, expect, test } from 'vitest';
import { addDays, toIso, weekday } from '../time/plain-date.ts';
import { EASIEST_DAY, PARTS, TOTALS, WALK } from './itinerary.ts';

describe('itinerary', () => {
  test('parts and the flight home cover 7 to 28 May with no gaps', () => {
    expect(toIso(WALK.start)).toBe('2028-05-07');
    expect(toIso(WALK.flightHome)).toBe('2028-05-28');
    expect(PARTS.map((p) => p.number)).toEqual([1, 2, 3, 4]);

    let next = WALK.start;
    for (const part of PARTS) {
      expect(toIso(part.from)).toBe(toIso(next));
      next = addDays(part.to, 1);
    }
    expect(toIso(next)).toBe(toIso(WALK.flightHome));
  });

  test('totals are 315 km, 22 days and 16 walking days', () => {
    expect(TOTALS).toEqual({ km: 315, days: 22, walkingDays: 16 });
  });

  test('the easiest day is Friday 12 May and inside part 1', () => {
    const part = PARTS.find((p) => p.number === EASIEST_DAY.part);

    expect(toIso(EASIEST_DAY.date)).toBe('2028-05-12');
    expect(weekday(EASIEST_DAY.date)).toBe(5);
    expect(part).toBeDefined();
    expect(toIso(EASIEST_DAY.date) >= toIso(part?.from ?? WALK.start)).toBe(
      true,
    );
    expect(toIso(EASIEST_DAY.date) <= toIso(part?.to ?? WALK.start)).toBe(true);
  });

  test('the special days sit inside their parts', () => {
    const [p1, p2, p3, p4] = PARTS;

    expect(p1.dayTripDays).toBeLessThanOrEqual(p1.walkingDays);
    expect(p2.km).toBeNull();
    expect(toIso(p3.arrival)).toBe('2028-05-22');
    expect(toIso(p4.lastDay)).toBe(toIso(p4.to));
    expect(p4.lastDayKm).toBe(13);
  });
});
