// The words of the site. Each language is a value of Messages, so tsc
// refuses a language that lacks a key. A sentence with a number or a date
// in it is a function of the facts it states.

import type { PartNumber } from '../content/itinerary.ts';
import type { PlainDate } from '../time/plain-date.ts';
import { en } from './en.ts';
import { es } from './es.ts';
import type { Lang } from './lang.ts';

type Sentence<F> = (facts: F) => string;

interface PartMessages<Invite> {
  /** "England: Reading to Southampton"; the page adds the number. */
  readonly name: string;
  /** The name as it reads inside a sentence of the join email. */
  readonly inSentence: string;
  /** The line under the heading, with the distance where there is one. */
  readonly about: Sentence<{ km: number }> | string;
  readonly invite: Sentence<Invite>;
}

export interface Messages {
  /** The value of <html lang>. */
  readonly htmlLang: string;
  /** This language's name, in itself: the link to it from the other one. */
  readonly languageName: string;
  readonly site: {
    readonly name: string;
    /** The logo link's hidden name. */
    readonly ownerName: string;
  };
  readonly footer: {
    readonly contact: string;
  };
  readonly joinEmail: {
    readonly partSubject: Sentence<{ part: PartNumber }>;
    readonly partBody: Sentence<{
      part: PartNumber;
      inSentence: string;
      from: PlainDate;
      to: PlainDate;
    }>;
    readonly daySubject: Sentence<{ date: PlainDate }>;
    readonly dayBody: Sentence<{ date: PlainDate; title: string }>;
  };
  readonly errors: {
    readonly notFound: {
      readonly heading: string;
      readonly link: string;
    };
    readonly inviteGone: {
      readonly heading: string;
      readonly body: string;
      readonly link: string;
    };
  };
  readonly home: {
    readonly title: string;
    readonly description: string;
    readonly h1: string;
    readonly lead: string;
    readonly seeWhere: string;
    readonly plan: {
      readonly heading: string;
      readonly when: string;
      readonly whenValue: Sentence<{ from: PlainDate; to: PlainDate }>;
      readonly start: string;
      readonly startValue: string;
      readonly finish: string;
      readonly finishValue: string;
      readonly distance: string;
      readonly distanceValue: Sentence<{ km: number }>;
      readonly days: string;
      readonly daysValue: Sentence<{ days: number; walkingDays: number }>;
    };
    readonly notice: {
      readonly heading: Sentence<{ maxShiftDays: number }>;
      readonly body: Sentence<{ confirmBy: PlainDate }>;
    };
    readonly camino: string;
    readonly route: {
      readonly heading: Sentence<{ parts: number }>;
      readonly intro: string;
      /** For public visitors, who have no join buttons. */
      readonly publicLine: string;
    };
    /** Under the first join button: what the buttons do. */
    readonly mailLine: string;
    readonly youCanJoin: string;
    readonly parts: {
      readonly 1: PartMessages<{ walkingDays: number; dayTripDays: number }>;
      readonly 2: PartMessages<{ departs: PlainDate; arrives: PlainDate }>;
      readonly 3: PartMessages<{ walkingDays: number; arrival: PlainDate }>;
      readonly 4: PartMessages<{
        walkingDays: number;
        lastDay: PlainDate;
        lastDayKm: number;
      }>;
    };
    readonly joinPart: Sentence<{ part: PartNumber }>;
    readonly flyHome: Sentence<{ date: PlainDate }>;
    readonly easiest: {
      readonly heading: string;
      readonly intro: string;
      readonly date: Sentence<{ date: PlainDate }>;
      readonly tag: string;
      readonly title: string;
      readonly walk: string;
      readonly walkValue: Sentence<{ km: number }>;
      readonly gettingThere: string;
      readonly gettingThereValue: string;
      readonly gettingHome: string;
      readonly gettingHomeValue: string;
      readonly join: string;
    };
    readonly follow: {
      readonly heading: string;
      readonly body: Sentence<{ from: PlainDate }>;
    };
  };
}

export const messages: Readonly<Record<Lang, Messages>> = { en, es };
