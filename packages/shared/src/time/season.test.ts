import { describe, expect, test } from 'vitest';
import { SEASON_STARTS, seasonAt } from './season.ts';

describe('seasons', () => {
  test('seasons switch at midnight London time', () => {
    const { onTheWay, book } = SEASON_STARTS;

    expect(onTheWay).toBe(Date.UTC(2028, 4, 6, 23));
    expect(book).toBe(Date.UTC(2028, 4, 28, 23));
    expect(seasonAt(onTheWay - 1)).toBe('invitation');
    expect(seasonAt(onTheWay)).toBe('on-the-way');
    expect(seasonAt(onTheWay + 1)).toBe('on-the-way');
    expect(seasonAt(book - 1)).toBe('on-the-way');
    expect(seasonAt(book)).toBe('book');
    expect(seasonAt(book + 1)).toBe('book');
  });
});
