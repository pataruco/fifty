// Which Home the site shows. Each season starts at midnight London time
// (BST, UTC+1), so 23:00 UTC the evening before.

export type Season = 'invitation' | 'on-the-way' | 'book';

export const SEASON_STARTS = {
  /** Sunday 7 May 2028, the first day of the walk. */
  onTheWay: Date.UTC(2028, 4, 6, 23),
  /** Monday 29 May 2028, the day after the flight home. */
  book: Date.UTC(2028, 4, 28, 23),
} as const;

export function seasonAt(now: number): Season {
  if (now < SEASON_STARTS.onTheWay) return 'invitation';
  if (now < SEASON_STARTS.book) return 'on-the-way';
  return 'book';
}
