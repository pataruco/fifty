// English, from the canvas board "D · Invitation", changed where the brief
// says so.

import {
  formatDate,
  formatDateRange,
  formatDistance,
  formatMonthYear,
  NBSP,
  weekdayName,
} from './format.ts';
import type { Messages } from './messages.ts';

const plural = (n: number, one: string, many: string) =>
  `${n}${NBSP}${n === 1 ? one : many}`;
const day = { weekday: true, year: false } as const;

export const en = {
  htmlLang: 'en-GB',
  languageName: 'English',
  site: {
    name: 'Fifty',
    ownerName: 'Pedro Martin Valera',
  },
  footer: {
    contact: 'Contact me',
  },
  home: {
    title: 'Walk a day with me',
    description:
      "In May 2028 I turn 50. To mark it, I'm walking from Reading in England to Finisterre in Spain. You can join me for a day or more.",
    h1: 'Walk a day with me',
    lead: "In May 2028 I turn 50. To mark it, I'm walking from Reading in England to Finisterre in Spain. You can join me for a day or more.",
    seeWhere: 'See where you can join',
    plan: {
      heading: 'The plan',
      when: 'When',
      whenValue: ({ from, to }) =>
        formatDateRange(from, to, 'en', { weekday: false, year: true }),
      start: 'Start',
      startValue: 'Reading Abbey, England',
      finish: 'Finish',
      finishValue: 'The lighthouse at Finisterre, Spain',
      distance: 'Distance',
      distanceValue: ({ km }) => `About ${formatDistance(km, 'en')}`,
      days: 'Days',
      daysValue: ({ days, walkingDays }) =>
        `${days} in total. I walk on ${walkingDays} of them.`,
    },
    notice: {
      heading: ({ maxShiftDays }) =>
        `Dates in Spain might change by ${plural(maxShiftDays, 'day', 'days')}`,
      body: ({ confirmBy }) =>
        `I'll confirm them when I book the ferry, around ${formatMonthYear(confirmBy, 'en')}.`,
    },
    camino:
      'The route follows the Camino de Santiago. It is an old pilgrim path to the city of Santiago de Compostela.',
    route: {
      heading: ({ parts }) => `The route in ${parts} parts`,
      intro: `You can join any part. Come for 1${NBSP}day or stay for more.`,
    },
    youCanJoin: 'You can join',
    parts: {
      1: {
        name: 'England: Reading to Southampton',
        about: ({ km }) =>
          `${formatDistance(km, 'en')} on a path called St James' Way.`,
        invite: ({ walkingDays, dayTripDays }) =>
          `Come for 1${NBSP}day or more. ${dayTripDays} of the ${plural(walkingDays, 'day', 'days')} are easy day trips by train from London.`,
      },
      2: {
        name: 'Ferry to Spain: Portsmouth to Ferrol',
        about:
          'No walking. A ferry to Santander in Spain, then a bus or train along the north coast to Ferrol.',
        invite: ({ departs, arrives }) =>
          `Come on the ferry with me. It leaves Portsmouth on ${weekdayName(departs, 'en')} evening and reaches Santander on ${weekdayName(arrives, 'en')} morning. You book your own ticket and cabin.`,
      },
      3: {
        name: 'Spain: Ferrol to Santiago de Compostela',
        about: ({ km }) =>
          `${formatDistance(km, 'en')} on a path called the Camino Inglés. That means the English Way.`,
        invite: ({ walkingDays, arrival }) =>
          `Walk all ${plural(walkingDays, 'day', 'days')}, or fly to Santiago de Compostela for the arrival on ${formatDate(arrival, 'en', day)}.`,
      },
      4: {
        name: 'Spain: Santiago de Compostela to Finisterre',
        about: ({ km }) => `${formatDistance(km, 'en')} to the Atlantic coast.`,
        invite: ({ walkingDays, lastDay, lastDayKm }) =>
          `Walk all ${plural(walkingDays, 'day', 'days')}, or only the last one on ${formatDate(lastDay, 'en', day)}. It is ${formatDistance(lastDayKm, 'en')}.`,
      },
    },
    joinPart: ({ part }) => `Message Pedro to join part ${part}`,
    flyHome: ({ date }) => `I fly home on ${formatDate(date, 'en', day)}.`,
    easiest: {
      heading: 'The easiest day to join',
      intro: 'A day trip from London, with a short walk and a pub lunch.',
      date: ({ date }) => formatDate(date, 'en', { weekday: true, year: true }),
      tag: 'Day trip',
      title: 'Winchester and the South Downs',
      walk: 'The walk',
      walkValue: ({ km }) =>
        `${formatDistance(km, 'en')}. A loop from Winchester over Cheesefoot Head, with a pub lunch.`,
      gettingThere: 'Getting there',
      gettingThereValue: `About 1${NBSP}hour by train from London Waterloo.`,
      gettingHome: 'Getting home',
      gettingHomeValue: 'Trains back to London the same evening.',
      join: 'Message Pedro to join this day',
    },
    follow: {
      heading: 'Follow the walk from home',
      body: ({ from }) =>
        `From ${formatDate(from, 'en', { weekday: true, year: true })}, this page shows where I am each day. Most evenings I'll add a photo and a few lines.`,
    },
  },
} as const satisfies Messages;
