// Spanish, from the canvas board "D · Invitación (Spanish)", changed where
// the brief says so. Venezuelan Spanish, informal "tú", kilometres only.
// A first draft for Pedro to rewrite.

import {
  capitalise,
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

export const es = {
  htmlLang: 'es',
  languageName: 'Español',
  site: {
    name: 'Fifty',
    ownerName: 'Pedro Martín Valera',
  },
  footer: {
    contact: 'Escríbeme',
  },
  joinEmail: {
    partSubject: ({ part }) => `Ir a la parte ${part} de tu caminata`,
    partBody: ({ part, inSentence, from, to }) =>
      `Hola, Pedro:\n\nMe gustaría ir a la parte ${part}: ${inSentence}, ${formatDateRange(from, to, 'es', { weekday: true, year: true })}.`,
    daySubject: ({ date }) =>
      `Ir contigo el ${formatDate(date, 'es', { weekday: true, year: true })}`,
    dayBody: ({ date, title }) =>
      `Hola, Pedro:\n\nMe gustaría ir contigo a la caminata del ${formatDate(date, 'es', { weekday: true, year: true })}: ${title}.`,
  },
  errors: {
    notFound: {
      heading: 'Esta página no existe',
      link: 'Leer la invitación',
    },
    inviteGone: {
      heading: 'Este enlace de invitación ya no funciona',
      body: 'Puede que Pedro lo haya cambiado. Si conoces a Pedro, pídele el nuevo en hola@pataruco.dev.',
      link: 'Leer la invitación',
    },
  },
  home: {
    title: 'Camina un día conmigo',
    description:
      'En mayo de 2028 voy a caminar desde Reading, en Inglaterra, hasta Finisterre, en España. Es por mis 50 años, que cumplo en julio. Puedes acompañarme un día o más.',
    h1: 'Camina un día conmigo',
    lead: 'En mayo de 2028 voy a caminar desde Reading, en Inglaterra, hasta Finisterre, en España. Es por mis 50 años, que cumplo en julio. Puedes acompañarme un día o más.',
    seeWhere: 'Ver dónde puedes acompañarme',
    plan: {
      heading: 'El plan',
      when: 'Cuándo',
      whenValue: ({ from, to }) =>
        capitalise(
          formatDateRange(from, to, 'es', { weekday: false, year: true }),
        ),
      start: 'Salida',
      startValue: 'Abadía de Reading, Inglaterra',
      finish: 'Llegada',
      finishValue: 'Faro de Finisterre, España',
      distance: 'Distancia',
      distanceValue: ({ km }) => `Unos ${formatDistance(km, 'es')}`,
      days: 'Días',
      daysValue: ({ days, walkingDays }) =>
        `${days} en total. Camino ${walkingDays} de ellos.`,
    },
    notice: {
      heading: ({ maxShiftDays }) =>
        `Las fechas en España pueden cambiar ${plural(maxShiftDays, 'día', 'días')}`,
      body: ({ confirmBy }) =>
        `Las confirmo cuando compre el pasaje del ferry, hacia ${formatMonthYear(confirmBy, 'es')}.`,
    },
    camino:
      'La ruta sigue el Camino de Santiago. Es un antiguo camino de peregrinos que llega a la ciudad de Santiago de Compostela.',
    route: {
      heading: ({ parts }) => `La ruta en ${parts} partes`,
      intro: `Puedes acompañarme en cualquier parte. Ven 1${NBSP}día o quédate más.`,
      publicLine:
        'Para acompañarme necesitas mi enlace de invitación. Si me conoces, pídemelo en hola@pataruco.dev.',
    },
    mailLine:
      'Se abre un correo a Pedro con la parte o el día ya escritos. Puedes cambiar el correo antes de enviarlo.',
    youCanJoin: 'Puedes venir',
    parts: {
      1: {
        name: 'Inglaterra: de Reading a Southampton',
        inSentence: 'Inglaterra, de Reading a Southampton',
        about: ({ km }) =>
          `${formatDistance(km, 'es')} por un sendero llamado St James' Way.`,
        invite: ({ walkingDays, dayTripDays }) =>
          `Ven 1${NBSP}día o más. En ${dayTripDays} de los ${plural(walkingDays, 'día', 'días')} es fácil ir y volver en tren desde Londres el mismo día.`,
      },
      2: {
        name: 'Ferry a España: de Portsmouth a Ferrol',
        inSentence: 'ferry a España, de Portsmouth a Ferrol',
        about:
          'Sin caminar. Un ferry hasta Santander, en España. Después, autobús o tren por la costa norte hasta Ferrol.',
        invite: ({ departs, arrives }) =>
          `Ven conmigo en el ferry. Sale de Portsmouth el ${weekdayName(departs, 'es')} por la noche y llega a Santander el ${weekdayName(arrives, 'es')} por la mañana. Tú compras tu pasaje y tu camarote.`,
      },
      3: {
        name: 'España: de Ferrol a Santiago de Compostela',
        inSentence: 'España, de Ferrol a Santiago de Compostela',
        about: ({ km }) => `${formatDistance(km, 'es')} por el Camino Inglés.`,
        invite: ({ walkingDays, arrival }) =>
          `Camina los ${plural(walkingDays, 'día', 'días')}, o ven en avión a Santiago de Compostela para la llegada, el ${formatDate(arrival, 'es', day)}.`,
      },
      4: {
        name: 'España: de Santiago de Compostela a Finisterre',
        inSentence: 'España, de Santiago de Compostela a Finisterre',
        about: ({ km }) =>
          `${formatDistance(km, 'es')} hasta la costa del Atlántico.`,
        invite: ({ walkingDays, lastDay, lastDayKm }) =>
          `Camina los ${plural(walkingDays, 'día', 'días')}, o solo el último, el ${formatDate(lastDay, 'es', day)}. Son ${formatDistance(lastDayKm, 'es')}.`,
      },
    },
    joinPart: ({ part }) => `Escribir a Pedro para ir a la parte ${part}`,
    flyHome: ({ date }) =>
      `Vuelvo a casa en avión el ${formatDate(date, 'es', day)}.`,
    easiest: {
      heading: 'El día más fácil para venir',
      intro:
        'Un paseo de un día desde Londres, con una caminata corta y almuerzo en un pub.',
      date: ({ date }) =>
        capitalise(formatDate(date, 'es', { weekday: true, year: true })),
      tag: 'Ida y vuelta en el día',
      title: 'Winchester y las colinas de South Downs',
      walk: 'La caminata',
      walkValue: ({ km }) =>
        `${formatDistance(km, 'es')}. Una ruta circular desde Winchester por Cheesefoot Head, con almuerzo en un pub.`,
      gettingThere: 'Cómo llegar',
      gettingThereValue: `Cerca de 1${NBSP}hora en tren desde la estación de Waterloo, en Londres.`,
      gettingHome: 'Cómo volver',
      gettingHomeValue: 'Hay trenes de vuelta a Londres ese mismo día.',
      join: 'Escribir a Pedro para ir este día',
    },
    follow: {
      heading: 'Sigue la caminata desde casa',
      body: ({ from }) =>
        `Desde el ${formatDate(from, 'es', { weekday: true, year: true })}, esta página muestra dónde estoy cada día. Casi todas las noches voy a poner una foto y unas líneas.`,
    },
  },
} as const satisfies Messages;
