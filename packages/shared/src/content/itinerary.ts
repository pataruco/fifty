// The facts of the walk, as drawn on the canvas. Words about them live in
// i18n; anything that can be worked out from these is worked out.

import {
  daysInclusive,
  type PlainDate,
  plainDate,
} from '../time/plain-date.ts';

export type PartNumber = 1 | 2 | 3 | 4;

export interface Part {
  readonly number: PartNumber;
  /** The first day of the part. */
  readonly from: PlainDate;
  /** The last day of the part. */
  readonly to: PlainDate;
  /** Walking distance; null when the part is travel only. */
  readonly km: number | null;
  readonly walkingDays: number;
}

export const WALK = {
  /** At Reading Abbey. */
  start: plainDate('2028-05-07'),
  flightHome: plainDate('2028-05-28'),
  /** The Spanish dates may move until Pedro books the ferry. */
  provisional: {
    maxShiftDays: 1,
    /** Only the month and year are shown. */
    confirmBy: plainDate('2027-05-01'),
  },
} as const;

export const PARTS = [
  {
    number: 1,
    from: plainDate('2028-05-07'),
    to: plainDate('2028-05-14'),
    km: 110,
    walkingDays: 7,
    /** Days that are an easy return trip by train from London. */
    dayTripDays: 5,
  },
  {
    number: 2,
    from: plainDate('2028-05-15'),
    to: plainDate('2028-05-17'),
    km: null,
    walkingDays: 0,
  },
  {
    number: 3,
    from: plainDate('2028-05-18'),
    to: plainDate('2028-05-23'),
    km: 115,
    walkingDays: 5,
    /** Arrival in Santiago de Compostela. */
    arrival: plainDate('2028-05-22'),
  },
  {
    number: 4,
    from: plainDate('2028-05-24'),
    to: plainDate('2028-05-27'),
    km: 90,
    walkingDays: 4,
    lastDay: plainDate('2028-05-27'),
    lastDayKm: 13,
  },
] as const satisfies readonly [
  Part & { readonly dayTripDays: number },
  Part,
  Part & { readonly arrival: PlainDate },
  Part & { readonly lastDay: PlainDate; readonly lastDayKm: number },
];

/** The Winchester loop: a day trip from London. */
export const EASIEST_DAY = {
  date: plainDate('2028-05-12'),
  part: 1,
  km: 13,
} as const satisfies { date: PlainDate; part: PartNumber; km: number };

export const TOTALS = {
  km: PARTS.reduce((sum, p) => sum + (p.km ?? 0), 0),
  days: daysInclusive(WALK.start, WALK.flightHome),
  walkingDays: PARTS.reduce((sum, p) => sum + p.walkingDays, 0),
} as const;
