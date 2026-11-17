// A calendar day with no time and no time zone. Date is used only through
// Date.UTC and getUTC*, so the local time zone never touches the result.

declare const plainDateBrand: unique symbol;
export type PlainDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly [plainDateBrand]: true;
};

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const DAY_MS = 86_400_000;

const toUtc = (d: PlainDate) => Date.UTC(d.year, d.month - 1, d.day);

function fromUtc(ms: number): PlainDate {
  const date = new Date(ms);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  } as PlainDate;
}

/** Parses `YYYY-MM-DD` and refuses days that do not exist. */
export function plainDate(iso: string): PlainDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match) {
    const [year, month, day] = match.slice(1).map(Number) as [
      number,
      number,
      number,
    ];
    const d = fromUtc(Date.UTC(year, month - 1, day));
    if (d.year === year && d.month === month && d.day === day) return d;
  }
  throw new TypeError(`plainDate: not a calendar day: ${iso}`);
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');

export function toIso(d: PlainDate): string {
  return `${pad(d.year, 4)}-${pad(d.month, 2)}-${pad(d.day, 2)}`;
}

/** 0 is Sunday. */
export function weekday(d: PlainDate): Weekday {
  return new Date(toUtc(d)).getUTCDay() as Weekday;
}

export function addDays(d: PlainDate, n: number): PlainDate {
  return fromUtc(toUtc(d) + n * DAY_MS);
}

/** How many calendar days from a to b, counting both. */
export function daysInclusive(a: PlainDate, b: PlainDate): number {
  return (toUtc(b) - toUtc(a)) / DAY_MS + 1;
}
