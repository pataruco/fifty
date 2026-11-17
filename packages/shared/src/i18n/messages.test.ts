import { describe, expect, test } from 'vitest';
import { EASIEST_DAY, PARTS, TOTALS, WALK } from '../content/itinerary.ts';
import { plainDate } from '../time/plain-date.ts';
import { NBSP } from './format.ts';
import { LANGS, type Lang } from './lang.ts';
import { messages } from './messages.ts';

const [, , , p4] = PARTS;

/** Every key path, with functions as leaves. */
function shape(value: unknown, path = ''): string[] {
  if (value === null || typeof value !== 'object') return [path];
  return Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([key, v]) => shape(v, `${path}.${key}`));
}

// One bag of facts that satisfies every message function's parameter.
const facts = {
  km: 110,
  walkingDays: 4,
  dayTripDays: 5,
  lastDay: p4.lastDay,
  lastDayKm: p4.lastDayKm,
  arrival: plainDate('2028-05-22'),
  departs: plainDate('2028-05-15'),
  arrives: plainDate('2028-05-17'),
  date: EASIEST_DAY.date,
  from: WALK.start,
  to: WALK.flightHome,
  days: TOTALS.days,
  maxShiftDays: 1,
  confirmBy: WALK.provisional.confirmBy,
  parts: PARTS.length,
  part: 2,
};

/** Every string the messages can produce, functions called with facts. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') return strings(value(facts));
  if (value === null || typeof value !== 'object') return [];
  return Object.values(value).flatMap(strings);
}

const all = (lang: Lang) => strings(messages[lang]);

describe('messages', () => {
  test('en and es have the same keys at every depth', () => {
    expect(shape(messages.es)).toEqual(shape(messages.en));
  });

  test('computed sentences match the canvas', () => {
    const f = {
      walkingDays: p4.walkingDays,
      lastDay: p4.lastDay,
      lastDayKm: p4.lastDayKm,
    };

    expect(messages.en.home.parts[4].invite(f)).toBe(
      `Walk all 4${NBSP}days, or only the last one on Saturday 27 May. It is 13${NBSP}km (8${NBSP}miles).`,
    );
    expect(messages.es.home.parts[4].invite(f)).toBe(
      `Camina los 4${NBSP}días, o solo el último, el sábado 27 de mayo. Son 13${NBSP}km.`,
    );
    expect(messages.en.home.plan.distanceValue({ km: TOTALS.km })).toBe(
      `About 315${NBSP}km (196${NBSP}miles)`,
    );
    expect(
      messages.es.home.plan.whenValue({
        from: WALK.start,
        to: WALK.flightHome,
      }),
    ).toBe('Del 7 al 28 de mayo de 2028');
    expect(
      messages.en.home.parts[2].invite({
        departs: facts.departs,
        arrives: facts.arrives,
      }),
    ).toBe(
      'Come on the ferry with me. It leaves Portsmouth on Monday evening and reaches Santander on Wednesday morning. You book your own ticket and cabin.',
    );
    expect(messages.es.home.joinPart({ part: 3 })).toBe(
      'Escribir a Pedro para ir a la parte 3',
    );
    expect(
      messages.en.home.notice.body({ confirmBy: WALK.provisional.confirmBy }),
    ).toBe("I'll confirm them when I book the ferry, around May 2027.");
  });

  test('Spanish never mentions miles', () => {
    expect(all('es').filter((s) => /\bmiles?\b|millas?/i.test(s))).toEqual([]);
  });

  test('every English km figure is followed by miles in brackets', () => {
    const bare = all('en').filter((s) =>
      [...s.matchAll(new RegExp(`\\d+${NBSP}km(.{0,20})`, 'g'))].some(
        (m) => !new RegExp(`^ \\(\\d+${NBSP}miles?\\)`).test(m[1] ?? ''),
      ),
    );

    expect(bare).toEqual([]);
  });

  test('no number is split from its unit by a breaking space', () => {
    for (const lang of LANGS) {
      const split = all(lang).filter((s) =>
        /\d (km|miles?|days?|días?|hours?|horas?)\b/.test(s),
      );

      expect(split).toEqual([]);
    }
  });

  test('no string mentions WhatsApp, a phone number, wa.me, tel: or sms:', () => {
    for (const lang of LANGS) {
      const bad = all(lang).filter((s) =>
        /whatsapp|wa\.me|tel:|sms:|\+?\d[\d ()-]{7,}\d/i.test(s),
      );

      expect(bad).toEqual([]);
    }
  });
});
