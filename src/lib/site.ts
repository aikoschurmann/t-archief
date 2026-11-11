/**
 * Everything the site says about the studio, in one place. Used by the pages and by the
 * build step in vite.config.ts that pre-renders every route to static HTML, so search
 * engines and link previews see the same text as visitors.
 */

export const SITE = 'https://tarchief.studio';
export const STUDIO = "Studio 't archief";
export const PERSON = 'Aiko Schurmann';
export const EMAIL = 'info@tarchief.studio';
export const INSTAGRAM = 'https://instagram.com/tarchief.studio';
export const INSTAGRAM_HANDLE = '@tarchief.studio';

// Projects with `"section": "vrij"` in meta.json (landscape, portrait) are listed apart
// from the stage and event work, and stay off the home page
export const FREE_WORK = 'vrij';

// Organisations that commissioned work. Only add names you can point to.
export const CLIENTS = ['30CC', 'Festival Rode Hond'];

// One sentence from a client. Shown on the info page once it is filled in.
export const QUOTE: { text: string; by: string } | null = null;

export type Lang = 'nl' | 'en';

export type Copy = {
  positioning: string;
  book: string;
  statement: string;
  about: string;
  labels: {
    about: string; clients: string; offers: string; region: string; contact: string; book: string; free: string;
  };
  offers: string[];
  region: string;
  form: {
    intro: string; name: string; email: string; organisation: string; date: string; place: string;
    type: string; types: string[]; purpose: string; purposeHint: string; send: string; sending: string;
    sent: string; failed: string;
  };
};

export const COPY: Record<Lang, Copy> = {
  nl: {
    positioning: 'Podium- en eventfotografie.',
    book: 'Contact',
    statement: 'Fotografie voor podium, muziek en evenementen.',
    about: `${STUDIO} is de fotografiestudio van ${PERSON}, vanuit Leuven en Brussel. Voorstellingen, concerten en evenementen, en portretten van de makers erachter. De beelden zijn er voor pers, affiche, website en archief: wat er op de scène gebeurde, zoals het voelde in de zaal.`,
    labels: {
      about: 'Over', clients: 'Opdrachtgevers', offers: 'Werk', region: 'Regio', contact: 'Contact', book: 'Contact', free: 'Vrij werk'
    },
    offers: ['Podium & concert', 'Evenement & congres', 'Portret & pers'],
    region: 'Leuven en Brussel',
    form: {
      intro: 'Stuur een bericht voor beschikbaarheid of tarieven.',
      name: 'Naam', email: 'E-mail', organisation: 'Organisatie', date: 'Datum', place: 'Locatie',
      type: 'Onderwerp',
      types: ['Podium / Concert', 'Event / Congres', 'Portret / Pers', 'Andere'],
      purpose: 'Gebruik', purposeHint: 'Pers, website, archief, socials …',
      send: 'Verstuur', sending: 'Verzenden …', sent: 'Verstuurd.',
      failed: `Mislukt. Mail rechtstreeks naar ${EMAIL}.`
    }
  },
  en: {
    positioning: 'Stage and event photography.',
    book: 'Contact',
    statement: 'Photography for stage, live music and events.',
    about: `${STUDIO} is the photography studio of ${PERSON}, based in Leuven and Brussels. Performances, concerts and events, and portraits of the people who make them. The pictures are made for press, posters, web and archive: what happened on stage, the way it felt in the room.`,
    labels: {
      about: 'About', clients: 'Clients', offers: 'Work', region: 'Location', contact: 'Contact', book: 'Contact', free: 'Personal work'
    },
    offers: ['Stage & live', 'Events', 'Portrait & press'],
    region: 'Leuven and Brussels',
    form: {
      intro: 'Get in touch for availability and rates.',
      name: 'Name', email: 'Email', organisation: 'Organisation', date: 'Date', place: 'Location',
      type: 'Subject',
      types: ['Stage / Concert', 'Event / Conference', 'Portrait / Press', 'Other'],
      purpose: 'Usage', purposeHint: 'Press, web, archive, socials …',
      send: 'Send', sending: 'Sending …', sent: 'Sent.',
      failed: `Failed. Mail directly at ${EMAIL}.`
    }
  }
};


export const DESCRIPTION = `${STUDIO}: podium- en eventfotografie in Leuven en Brussel door ${PERSON}. Voorstellingen, concerten, events en persfoto's.`;

/** Alt text for a photo of a project: what it shows, not just a number. */
export function altFor(title: string, category: string | undefined, index: number, total: number) {
  const kind = category ? `${category}fotografie` : 'Foto';
  return `${kind}: ${title}, beeld ${index + 1} van ${total}`;
}
