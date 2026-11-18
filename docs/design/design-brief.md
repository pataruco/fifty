# Fifty: design brief

Draft 3, 15 November 2026. Amended on 17 November 2026 with the decisions made that day, after an adversarial review. For Pedro to challenge.

This is the design for the website that goes with the May 2028 walk from Reading to Finisterre. It says what the site is for, what it shows to whom, and how each page behaves. It stops short of technology choices; those belong in `docs/tech-spec.md`, which comes next. The chosen look, in English and Spanish, is on the design canvas: https://claude.ai/artifact/EcSi8PnRmjBdUBxQYmQtoC. A copy exported on 17 November 2026 sits beside this brief: `website-design.html` holds all eight boards, and there is a PNG of each of the four boards of direction D.

## The site in one paragraph

Fifty has three jobs, one after another. Before the walk it is an invitation: it tells friends and family what Pedro is doing and helps them pick a part of the route, or a single day, to walk with him. During the walk it answers one question, "where is Pedro today?", and carries a short daily journal. Afterwards it freezes into a keepsake that needs no server and no upkeep. It is one site whose front page changes with the calendar.

## Decisions made on 15 November 2026

| Question                   | Decision                                                                                       | What follows                                                                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Who sees what              | Public story, private details                                                                  | Anyone can read the invitation, the route, the dates and the journal. Pedro's position on the ground is shown only to people who arrive through the invite link. Made stricter on 17 November: see the next table. |
| How live the location is   | Check-ins, plus live tracking on meet-up days                                                  | Pedro taps "I'm here" a few times a day. On days when people are joining he also runs a tracker app (OwnTracks), so guests can find him. Who sends the check-in was reopened on 17 November: see the next table.   |
| How the journal is written | In Contentful                                                                                  | No editor to build. The weak points (signal, phone ergonomics, photo weight, long-term dependence) are dealt with under "The journal". Changed on 17 November: see the next table.                                 |
| How people join            | They message Pedro; the site keeps no list. Every part of the route carries its own invitation | No form, no stored submissions, no names of companions on the site. Each of the four parts says how to join it and has its own button. Meeting details travel by message.                                          |
| How the words are written  | Content design practice                                                                        | Start from what the reader needs, say the most important thing first, use plain words. See "Words on the page".                                                                                                    |
| Languages                  | English and Spanish                                                                            | Every page exists in both. Spanish is localised, not only translated. See "Language".                                                                                                                              |
| The look                   | Direction D, pataruco.dev                                                                      | Fifty uses the styles of Pedro's own blog. See "Look and feel".                                                                                                                                                    |

Assumed until Pedro says otherwise: the site is hidden from search engines; it is called Fifty; the only way to respond to a journal entry is to message Pedro; accessibility aims for WCAG 2.2 AAA where it can, as Pedro's other sites do; most Spanish readers are in Venezuela.

## Decisions made on 17 November 2026

An adversarial review of this brief, and what Pedro said during it, led to these. Where they differ from the table above, these win.

| Question                                            | Decision                                                                                        | What follows                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What the trail asks of the site                     | Pedro writes and edits during the walk, often with no signal, and uploads crawl                 | These are given, not things for a rehearsal to find out. Most of the decisions below follow from them.                                                                                                                                                                                                                                                                                                                                                                                    |
| Where the journal is written                        | On the trail page, in a form that keeps drafts on the phone                                     | The phone never talks to Contentful on the trail, because Contentful does not support mobile browsers, cannot work offline and cannot resume an upload. So one form has to be built after all. Contentful stays for what is written at a desk. See "The journal".                                                                                                                                                                                                                         |
| Where trail writing is kept                         | In the site's own store                                                                         | Journal entries, check-ins and changes of plan are kept by the site itself and are live as soon as they arrive. The site also keeps its own copy of what is written in Contentful. See "What lives where".                                                                                                                                                                                                                                                                                |
| How photos travel                                   | Shrunk on the phone, then sent in pieces                                                        | About 1600 px on the long side and 300 to 500 KB, with the location inside the photo removed. Words go first; photos follow and carry on from where they stopped. Originals go into The Book afterwards. See "Sending an entry".                                                                                                                                                                                                                                                          |
| Where photos are kept                               | On Pedro's phone, and in Contentful                                                             | The originals stay in the phone's photo library. The copies the site shows are kept in Contentful: the phone sends each small copy to the site, and the site passes it on. The site needs no photo store of its own. Pedro can upload originals to Contentful himself from a desk. See "Sending an entry".                                                                                                                                                                                |
| What else Pedro can change from the phone           | A notice, and today's stage                                                                     | No laptop and no deploy. Today can become a shorter or longer stage, a rest day or a travel day. See "When the plan changes".                                                                                                                                                                                                                                                                                                                                                             |
| What a day page shows when stages move              | A travel log                                                                                    | A day keeps its date. Its page shows the plan until the day comes, and what Pedro did from then on. See "When the plan changes".                                                                                                                                                                                                                                                                                                                                                          |
| How pages are made                                  | The site makes each page when it is asked for, from its own copy                                | Publishing changes data and never needs a deploy, so the freeze on 23 April 2028 is a freeze of the code. If a page cannot be made, the last good copy is shown. The Book is the same pages, made once and saved as files. The detail belongs in the tech spec.                                                                                                                                                                                                                           |
| How precise the public status is                    | The last named place Pedro has passed, and the part of the day                                  | On a published route a distance and a clock time together are a position, so both are for guests. See "Where Pedro is".                                                                                                                                                                                                                                                                                                                                                                   |
| Who sends a check-in                                | OwnTracks, if rehearsal 1 shows it is quick with one hand                                       | It already keeps a position that cannot be sent and posts it later. If it takes more than ten seconds, the trail page keeps its own "I'm here" button. See "The trail page".                                                                                                                                                                                                                                                                                                              |
| How light a page is                                 | As few requests as it can be                                                                    | Styles travel inside the page. No font file is shipped. The status refreshes only while the page is on screen and the day is still open, and the reader can stop it.                                                                                                                                                                                                                                                                                                                      |
| What happens to guests when the invite words change | They stay guests                                                                                | Changing the words keeps new devices out. It removes no one who is already in. See "Guests".                                                                                                                                                                                                                                                                                                                                                                                              |
| What the footer carries                             | Fifty's own, not the blog's                                                                     | A link to About, the journal's feed, a link to pataruco.dev and `hola@pataruco.dev`. No LinkedIn, GitHub or Bluesky, no blog feed and no "Updated on" line. See "On every page".                                                                                                                                                                                                                                                                                                          |
| How times reach the reader                          | Kept in UTC. Shown in the walker's time, with the reader's own time added on their device       | The page arrives with the walker's time and country, so it reads without JavaScript. Where JavaScript runs, the reader's own time is added and called "your time". The site never names the reader's country. See "Rules" and "Language".                                                                                                                                                                                                                                                 |
| Which apps carry messages                           | Email and text messages (SMS). No WhatsApp: Pedro does not use it, because it is a Meta product | The buttons that message Pedro open an email to an address made only for Fifty in his iCloud account. His phone number is not on the site: he gives it when he replies. Once a day is arranged, Pedro and the companion keep in touch by text message, on the day as well. Pedro posts in no family chat: one relative shares the link in the chat the family already uses, whichever app that is. The site still sends no notifications. See "Walk with me" and "Deliberately left out". |

## Names

The left column is what this brief, the content model and the code call a thing. The middle column is what a visitor reads. They differ on purpose: the code needs one exact noun, and the reader needs the plainest one.

| Name in the brief and the code | What the page says                                     | Meaning                                                                                            |
| ------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| The Way                        | "The route" / "La ruta"                                | The whole route, Reading to Finisterre                                                             |
| Leg                            | "Part", as in "part 3 of 4" / "Parte"                  | One of its four parts: England, the ferry to Spain, Ferrol to Santiago, Santiago to Finisterre     |
| Day                            | "Day 12" / "Día 12"                                    | One calendar day of the trip, numbered 0 (Sunday 7 May 2028) to 21 (Sunday 28 May 2028)            |
| Stage                          | Its two ends: "Pontedeume to Betanzos"                 | The walking done on a day. Rest, sea and travel days have none                                     |
| Postcard                       | "Journal entry" / "Entrada del diario"                 | One journal entry: a photo or a few, and a few lines                                               |
| Check-in                       | "Pedro sent his location" / "Pedro envió su ubicación" | One position Pedro sends by hand                                                                   |
| Live trail                     | "Live" / "En vivo"                                     | Positions sent by the tracker app on a meet-up day                                                 |
| Notice                         | "Change of plan" / "Cambio de planes"                  | A few lines from Pedro when the plan changes, shown at the top of Home                             |
| Travel log                     | "What Pedro did" / "Lo que hizo Pedro"                 | For each day, what Pedro actually did: where he walked from and to, or that he rested or travelled |
| Season                         | Never named                                            | Invitation, On the Way, or The Book                                                                |
| Prologue                       | "Before the walk" / "Antes de la caminata"             | Training walks before Day 0, written up as journal entries                                         |
| Guest                          | "You have Pedro's invite link"                         | Someone who has opened the invite link on their device                                             |
| Trail page                     | Only Pedro sees it                                     | Pedro's private page for his location, his journal and changes of plan                             |

## Who it is for

| Reader             | Their situation                                                                                                                             | What they need                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A companion        | A friend deciding whether to walk a day, or a whole part                                                                                    | Which parts and days are possible, how hard they are, how to get there and home, how to say yes                                                                  |
| A follower         | Family and friends far away, usually on a phone, usually arriving from a link a relative shared in the family chat, many reading in Spanish | Where he is today, that he has posted, what he saw. It has to load fast on a modest phone and a poor connection                                                  |
| Pedro on the trail | Tired, one hand free, often no signal, uploads that crawl, a battery to protect                                                             | Send his location within ten seconds, write with no signal, post within a few minutes of finding some, change the plan when it changes, never lose what he wrote |
| Pedro afterwards   | Years later, with the family                                                                                                                | The whole walk, intact, with nothing left to maintain                                                                                                            |

## Principles

**The page is the Way.** The route is the spine of the site: Reading at the top, Finisterre at the bottom. Days, journal entries and Pedro's position all hang on that line.

**The stage is the unit, not the coordinate.** "Day 12 of 21, past Miño, on the way to Betanzos" tells family more than a dot on a map of rural Galicia.

**Roughly where is public; exactly where is private.** The public sees the last named place Pedro has passed. Guests see how far he has walked, the time he said so, and his position on the ground. On a published route a distance and a clock time together are a position, so both stay with guests. Raw GPS never becomes public, not even afterwards.

**Never pretend to be live.** Every position carries its age. The site reports the last thing Pedro told it and how long ago. It is not a safety system and must never imply safety or danger.

**Reading needs nothing.** Pages are plain HTML first. They can be read without JavaScript, at 320 px wide, on a slow connection. A page asks for as little as it can: its styles travel inside it and no font file is shipped. Everything clever is an enhancement.

**A minute a day.** On the trail Pedro spends seconds sending his location and minutes writing. Then the phone goes back in the pocket.

**Nothing to debug on the trail.** Every moving part has a dull fallback, and all of it is rehearsed on training walks. The code does not change after 23 April 2028. From then on only words, photos and positions change, and publishing them never needs a deploy. If the site cannot make a page, it shows the last good copy of it.

**It ends as a book.** After the walk the site becomes static files that depend on nothing: not on Contentful, not on a tracker, not on an API.

## Three seasons

| Season     | Dates                | The front page leads with                 | Journal                            | Location                                         |
| ---------- | -------------------- | ----------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| Invitation | Launch to 6 May 2028 | The invitation, and how to join each part | Entries from training walks        | Off, except in rehearsals                        |
| On the Way | 7 to 28 May 2028     | Today: the day, the stage, where Pedro is | An entry most days                 | Check-ins; live for guests on meet-up days       |
| The Book   | From 29 May 2028     | The whole route, with every entry         | Complete, with an afterword on top | Frozen: where each check-in fell along the route |

The season follows the date. Pedro can override it for his own device, so that each season can be previewed and rehearsed before it arrives without changing what anyone else sees.

## Site map

| Page          | Address                  | Job                                                                                                               |
| ------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Home          | `/`                      | Changes by season, as above                                                                                       |
| The route     | `/way/`                  | The whole route on one page: four parts, twenty-two days                                                          |
| A day         | `/day/12/`               | One page per day, 0 to 21. Before: the plan and how to join. On the day: where Pedro is. After: the journal entry |
| Walk with me  | `/join/`                 | The practical guide for companions, part by part and day by day                                                   |
| Journal       | `/journal/`              | Every entry, newest first, training walks included                                                                |
| About         | `/about/`                | Why Pedro is doing this, how the site works, what it does with a visitor's data                                   |
| Guest welcome | `/hello/<invite words>/` | Where the invite link lands. It marks the device as a guest and moves on to Home                                  |
| Trail         | `/trail/`                | Pedro only: his location, stop sharing, write the journal, post a change of plan                                  |

Spanish pages mirror these under `/es/`. If Fifty becomes a section of pataruco.dev, these addresses sit under `/fifty/`.

## The pages

### Home

In the Invitation season, Home is the invitation. It opens with one line ("Walk a day with me"), then says who, what and when in three short sentences, then gives one button: "See where you can join". Below that sit the plan as a short list of facts, then the route in four parts.

Each part carries its own invitation. It has the part's name, distance and dates, a "You can join" label, one or two sentences on how, and a button: "Message Pedro to join part 2". The four invitations are:

| Part                                           | What the invitation says                                                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1. England: Reading to Southampton             | Come for 1 day or more. 5 of the 7 days are easy day trips by train from London                                                          |
| 2. Ferry to Spain: Portsmouth to Ferrol        | Come on the ferry. It leaves Portsmouth on Monday evening and reaches Santander on Wednesday morning. You book your own ticket and cabin |
| 3. Spain: Ferrol to Santiago de Compostela     | Walk all 5 days, or fly to Santiago de Compostela for the arrival on Monday 22 May                                                       |
| 4. Spain: Santiago de Compostela to Finisterre | Walk all 4 days, or only the last one on Saturday 27 May                                                                                 |

After the parts comes the easiest single day to join, worked through as an example: the walk, getting there, getting home, and the button "Message Pedro to join this day". Home ends with what following along will look like in May. A short letter from Pedro belongs here too, after the facts and not before them.

In the On the Way season, Home opens with today: the day number and date, the stage, and the last place Pedro has passed. Guests also see how far along he is and the time he said so. The latest journal entry follows. Then the route: the part Pedro is on is shown day by day, with joinable days labelled. Parts still to come keep their invitation and their button. Parts already walked are one line.

In The Book season, Home opens with a short afterword and the whole route, complete. Every day links to its journal entry. The invitations are gone.

In any season, if dates are still provisional (see "Corrections"), Home says so in a sentence near the dates. If Pedro has posted a change of plan, Home opens with it, above everything else (see "When the plan changes").

### A day

There is one page per day, and it changes as the day approaches and passes.

| When       | What the page shows                                                                                                                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before     | From and to, distance in km and miles, terrain, what there is to see. How joinable it is, in words. How to get there and how to get home. What to bring. For guests, the "Message Pedro to join this day" button and an "Add to calendar" file |
| On the day | Everything on Home's "today" block, for this day. For guests, the map                                                                                                                                                                          |
| After      | What Pedro did that day, from the travel log. The journal entry. Where the check-ins fell. The plan folds away underneath, marked as the plan                                                                                                  |

Rest days, the sea crossing and the travel day get the same page with different words: there is no stage, and no location is expected.

If Pedro changes today's stage from the trail page, the day page shows the new plan and says that it changed (see "When the plan changes").

Joinability is said in words, never by colour alone: "Day trip", "Day trip with a change of train", "Stay overnight", "Fly in".

### Walk with me

This is the page Pedro sends when someone asks "how would that work?". It is grouped by part. Each part opens with its invitation and its button, then lists its days in a table: date, stage, distance, how to get there and back, effort. The page also says what a day on the route is like, what to bring for a day walk, and what happens if Pedro is running early or late.

There are two buttons, and each says what it does. "Message Pedro to join this day" and "Message Pedro to join part 3" open an email to Pedro with the day or the part already written in it. A line under the first one on a page says so, and says the email can be changed before it is sent. The email goes to an address made only for Fifty in Pedro's iCloud account, so it can be switched off after the walk. The buttons appear for guests only. Pedro's phone number is not on the site at all: he gives it when he replies. The public page says instead: "To join, you need my invite link. If you know me, ask me for it at hola@pataruco.dev." (Changed on 18 November: the walk is in May, but Pedro turns 50 in July. There is one link for everyone, not one each, and the old line did not say what the link is for or how to ask for it.)

Once a day is arranged, Pedro and the companion keep in touch by text message (SMS), on the day as well. Nothing on the site opens WhatsApp or any other chat app.

### Journal

A list of entries, newest first. During the Invitation season it holds the training walks. A feed is offered so that people who use a reader can follow without checking the site.

### On every page

The footer is Fifty's own, not the blog's. It carries a link to About, the journal's feed, a link to pataruco.dev and the address `hola@pataruco.dev`. The address is there so that someone without the invite link has a way to ask Pedro for it. The footer has no links to LinkedIn, GitHub or Bluesky and no blog feed, because family and friends do not need them. It has no "Updated on" line, because each status line already carries its own time.

## Where Pedro is

### What people see

The public sees roughly where: the day and stage, the last named place on the route that Pedro has passed, the part of the day when he sent his location, and his one-line message if he wrote one. Once a day is finished the public also sees how far he walked. Never kilometres for a day in progress, never a clock time, never coordinates, and never a pin on a street map.

Guests see exactly where as well: kilometres walked today and in total (to the nearest kilometre), the nearest named place, the time of Pedro's last location and how long ago that was, a pin on a real map, a link that opens the spot in their own maps app, and, on meet-up days, the live trail.

After the walk the public sees where each check-in fell along the route. The raw positions stay in Pedro's own archive.

### What the site says

Each line answers "where is Pedro?" first and says who did what. None of them guesses. The public line names a place and a part of the day. The guest line adds the distance, the clock time and the map.

| Situation                                             | What everyone sees                                                                                          | What guests see                                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Walking day, no location yet                          | "Pedro has not sent his location yet today."                                                                | The same                                                                                                                        |
| Location sent before the first named place of the day | "Pedro has left Pontedeume. He sent his location this morning in Spain."                                    | As in the next three rows                                                                                                       |
| Location sent under 2 hours ago                       | "Pedro has passed Miño. He sent his location this afternoon in Spain."                                      | "Pedro is near Miño. He sent his location at 2:32pm in Spain (1:32pm your time). He has walked 11 km of today's 20 km." The map |
| 2 to 6 hours ago                                      | The same line. The part of the day carries its age                                                          | The same facts, with the age first: "3 hours ago, Pedro was near Miño." The map, with the age                                   |
| Over 6 hours ago                                      | The same line                                                                                               | "Pedro last sent his location at 9:10am, near Pontedeume." Nothing more is implied. The map, with the age                       |
| Arrived                                               | "Pedro arrived in Betanzos this afternoon. He walked 20 km today."                                          | "Pedro arrived in Betanzos at 4:40pm. He walked 20 km today." The map                                                           |
| Location turned off                                   | "Pedro has turned off location sharing today. He did this himself this morning."                            | The same, with the time: "at 8:05am". Nothing more                                                                              |
| Rest day                                              | "Today is a rest day in Santiago de Compostela."                                                            | The map, if Pedro sends his location                                                                                            |
| At sea                                                | "Pedro is on the ferry to Spain. There is no phone signal until he lands in Santander on Wednesday 17 May." | The same                                                                                                                        |
| Travelling                                            | "Pedro is travelling from Santander to Ferrol today."                                                       | The same                                                                                                                        |
| Meet-up day, tracker running                          | The same as any walking day                                                                                 | "Live. Updated 2 minutes ago", a moving pin and the path so far                                                                 |
| More than 1 km from the route                         | The same as any walking day                                                                                 | "Pedro is near Miño, a little way off the route." Distance walked is left alone. The map                                        |
| Pedro has changed where today's stage ends            | "Pedro now stops in Miño today, not Betanzos. He changed the plan this morning."                            | The same                                                                                                                        |
| Pedro has made today a rest day                       | "Pedro is resting in Pontedeume today. He changed the plan this morning."                                   | The same                                                                                                                        |
| Pedro has made today a travel day                     | "Pedro is travelling from Miño to Betanzos today. He changed the plan this morning."                        | The same                                                                                                                        |

The thresholds are first guesses and should be easy to change.

### Rules

A check-in carries the time Pedro's phone got its position, not the time the message reached the site, so one sent late from a dead spot is still right.

Times are given in the walker's local time, with the reader's own time beside it when that differs: "2:32pm in Spain (1:32pm your time)". Without JavaScript the page shows the walker's time only, and names the country.

Every time is kept in UTC. The reader's own time is worked out on their device, from its time zone, so the same page can be sent to everyone. It is called "your time". The site never names the reader's country: a device gives a time zone, and a time zone is not a country.

Public lines give the part of the day where Pedro is, never a clock time: morning until 12 noon, afternoon until 6pm, evening after that. They name the country too.

Kilometres come first. On English pages, miles follow in brackets wherever a companion is deciding whether they can manage a day. Spanish pages give kilometres only.

Pedro can remove his last check-in, for the tap made by mistake at the front door of where he is staying.

Pedro can stop sharing his location. This hides it from everyone, guests included, until he turns it back on.

Sea and travel days are read from the itinerary. The site does not wait for a location it cannot get. If Pedro changes today's stage, the site follows the new plan (see "When the plan changes").

On meet-up days Pedro starts the tracker app in the morning and stops it on arrival. The site treats the trail as live while positions keep arriving, and as a check-in once they stop. Nothing has to be scheduled in advance.

The status refreshes by itself only while the page is on screen and the day is still open. It stops once Pedro has arrived, on a rest day, at sea, and when sharing is off. The reader can stop it with a control named after what it does. A screen reader hears the line again only when the line changes.

## When the plan changes

A late ferry, a short day or an extra rest day will move the plan. That is when people flying to Santiago de Compostela most need the site to be right, and when Pedro is furthest from a laptop. He can do three things from the trail page. Each is kept on the phone if there is no signal, and none needs a deploy.

Post a notice. A few lines in his own words, in the first person: "I am 1 day behind. I now reach Santiago de Compostela on Tuesday 23 May." It sits at the top of Home under the words "Change of plan", with the day he wrote it, until he takes it down. It is shown in the language he wrote it in.

Change where today's stage ends.

Make today a rest day, or a travel day with where he is travelling from and to.

The site then follows the new plan for today. The day page and the status say what changed, and nothing waits for a stage that is not being walked. A change that moves later days is said in the notice.

Every day keeps a travel log, so no page has to be rewritten when stages move. A day keeps its date and its address. Until the day comes, its page shows the plan. From then on it shows what Pedro did: where he walked from and to, or that he rested or travelled. The plan folds away underneath, marked as the plan. While a notice is up, every day page still to come says that the plan has changed and links to the notice.

## Guests

One invite link, sent by Pedro in a message. Opening it once marks that device as a guest. There is no account and no password. The link is made of ordinary words, so it can be read out over the phone. If it leaks, Pedro changes the words: old links stop working and say so kindly. People who had already opened the old link stay guests. So changing the words keeps new devices out, and removes no one who is already in.

A guest gets four things a public visitor does not: how far Pedro has walked today and the time of his last location, the map, the live trail on meet-up days, and the buttons that message Pedro.

A guest can forget the device from the About page.

## The journal

### Where it is written

On the trail Pedro writes on the trail page, in a short form that keeps every draft on the phone. It works with no signal, and nothing typed is lost. Training walks are written the same way, so the form is rehearsed long before May 2028.

At a desk, before and after the walk, Pedro writes in Contentful: the letter, the guide for companions and the afterword. Contentful gives an editor he already knows and two languages on the free plan.

### Why the phone does not use Contentful

The first plan was to try Contentful's own web app on the phone. Three facts rule that out.

Contentful does not support mobile browsers. Its own help pages say so.

Its web app needs a connection to open and to save. Nothing in its documentation offers a way to work offline.

Its upload service takes a whole file in one go and cannot carry on after a break. At 100 kbit/s a 5 MB photo needs about 7 minutes without a single drop.

### What to watch in Contentful

It is somebody else's service. The free plan allows one space, 10,000 records, 100,000 API calls a month and 50 GB of image traffic a month, and no overage is allowed. Contentful describes the plan as for personal projects and not for full-scale production. Contentful became part of Salesforce in 2026, so the terms may change before May 2028.

### Four rules that make it safe

The phone never talks to Contentful on the trail. It talks to the site.

Visitors' browsers never talk to Contentful, and neither does the site when it makes a page. The site keeps its own copy of what is written there and makes pages from that copy. The monthly allowance then only has to cover Pedro's own edits. Photos are the open case: see "For the tech spec".

The site's own store, and the original photos, are somewhere Pedro controls. The Book must be buildable with Contentful switched off.

There is always a fallback that needs nothing built: write in the phone's notes app, and paste it into the form later.

### Sending an entry

Words go first. They are small and can be published at once. Photos follow in small pieces, and carry on from where they stopped if the signal drops. An entry can go out before its photos; they appear when they arrive.

Before a photo is sent the phone shrinks it to about 1600 px on the long side, which is 300 to 500 KB, and removes the location stored inside it. At 100 kbit/s that is about 30 seconds a photo. The site passes the small copy on to Contentful, which keeps it for the pages. The original stays in the phone's photo library and replaces the small copy in The Book. Pedro can also upload originals to Contentful himself, from a desk.

An iPhone sends nothing from a web page that is not open on the screen. The trail page says what is waiting and what to do: "2 photos are waiting to send. When you have signal, keep this page open until they have gone."

### The entry

An entry is short by design. It has a day, a time, a place name, one to three photos with a line describing each, an optional title, and a few lines of text. Longer pieces are allowed but the layout is drawn for the short ones. A day can have more than one.

An entry is written in whichever language Pedro likes that evening. The other language is optional. Where it is missing, the page shows the original and marks its language, so the browser's own translation can do the rest.

Pedro can change or remove an entry from the same form.

### What lives where

The itinerary (days, distances, how to get there, the invitation for each part, the line of the route) lives with the site's code, in both languages. It changes rarely, it is tied to the route files, and the site has to work without Contentful.

What Pedro writes on the move lives in the site's own store: journal entries, check-ins, notices and changes to today's stage.

Contentful holds what is written at a desk: the letter, the guide for companions and the afterword. Whether the words of the itinerary move there too is a question for the tech spec.

Photos live in two places. The originals stay on Pedro's phone. The copies the site shows are kept in Contentful, so the site needs no photo store of its own.

## The trail page

One screen, made for a thumb. It opens with no signal. Whatever Pedro does there is kept on the phone and sent when the page is next open with signal. From top to bottom:

Today's line: "Day 12, Pontedeume to Betanzos".

What is waiting to send, if anything: "1 location and 2 photos are waiting to send. When you have signal, keep this page open until they have gone." While it sends, it counts: "Sending photo 1 of 2." Then: "Everything is sent." The page never says that something will send by itself, because an iPhone sends nothing from a web page that is not on the screen.

The location the site last received: "Received at 2:32pm, near Miño", with a "Remove" link.

Sending a location. Rehearsal 1 decides how. The first choice is OwnTracks, the tracker app already used on meet-up days: its send-now button takes one position and, if there is no signal, keeps it and posts it later. If that takes more than ten seconds with one hand, the trail page has its own "I'm here" button, very large: pressing it takes one position, shows how accurate it is, and adds it to what is waiting. Either way, if the phone cannot get a position in twenty seconds, Pedro can send "I'm fine" with no position at all.

An optional line for the people at home, up to 80 characters. It appears on Home next to his location, in the language he wrote it in.

"I've arrived for the day", which closes the day on the public page.

"Stop sharing my location today", a switch.

On a meet-up day, whether the tracker is reaching the site: "Tracker working. Last position 2 minutes ago."

Today's journal entry: a short form on this page. Drafts are saved as he types. See "The journal".

A change of plan: a notice, where today's stage ends, a rest day or a travel day. See "When the plan changes".

Only Pedro can open this page. It installs to the phone's home screen like an app. If his phone is lost or broken he can sign in from another phone or a computer. It is in one language, whichever Pedro prefers.

## Language

The site is in English and Spanish. English lives at `/` and Spanish at `/es/`. Every page has a counterpart.

The header carries one link to the other language, named in that language: "Español" on English pages, "English" on Spanish pages. It keeps the reader on the same page. The site does not guess a language from the reader's location, and it does not redirect.

Spanish is localised, not only translated. That means:

Spanish is written by hand, in the informal "tú". It never uses "vosotros". It uses words that read naturally in Venezuela and in Spain: "pasaje", "autobús", "caminar", "por la mañana".

Dates read "viernes 12 de mayo de 2028".

Distances are in kilometres only.

Times follow the reader's own device where the browser can tell. A reader in Venezuela sees "2:32 p. m."; a reader in Spain sees "14:32". The second time in a status line is the reader's own, called "tu hora": "a las 2:32 p. m., hora de España (8:32 a. m., tu hora)". Without JavaScript, English pages use the 12-hour clock and Spanish pages the 24-hour clock, and both show the walker's time only.

Pilgrim words that are already Spanish need no gloss on Spanish pages: "el Camino Inglés".

Interface text, the itinerary and the invitations are translated by hand. Journal entries follow the rule in "The entry".

The Spanish on the canvas is a first draft for Pedro to rewrite. He is the native speaker.

## Words on the page

The words follow content design practice: begin with what the reader needs at that point, and give them exactly enough to act. These rules hold in both languages.

Say the most important thing first. On Day 12 that is where Pedro is, not the name of the site.

Write for a reading age of 9 to 11. Short sentences, one idea each. This is for a tired reader on a phone as much as for anyone.

Say who does what. "Pedro sent his location at 2:32pm", not "Location updated".

Be specific. "About 1 hour by train from London Waterloo", not "easy to reach".

Use numerals: 50, 7 days, 13 km. Write dates as "Friday 12 May 2028", with no "th".

Name a control after what it does. "Message Pedro to join this day", "Message Pedro to join part 1", "Open the map", "See where you can join". In Spanish, controls use the infinitive: "Escribir a Pedro para ir este día", "Abrir el mapa".

Name things as a visitor would. The route has parts, not legs. Pedro keeps a journal, not postcards. Pilgrim words keep their own language and are explained the first time: "the Camino Inglés. That means the English Way."

Use a list of facts where a paragraph would hide them: when, start, finish, distance, getting there, getting home.

Write the invitation and the journal in the first person, because Pedro wrote them. Write live status in the third person, because the site is reporting it.

Mark anything that is not real. Sample text in a mockup says it is a sample.

Give every photo a line of description. It is the photo's text for people who cannot see it.

## Look and feel

The look is direction D: Fifty uses the styles of pataruco.dev. The canvas shows it as two phone screens in each language: Home in the Invitation season, and Home on Day 12. The header link on each screen switches to the same screen in the other language.

Everything below is taken from the blog's stylesheet, `src/styles/index.css` in `github.com/pataruco/blog`, at phone width.

| Element                    | Value                                                                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typeface                   | Inter, then the system sans-serif. The blog names Inter but does not load it, and Fifty does not ship it either: a font file is one more thing to fetch on a slow connection |
| Body text                  | 18 px, line height 1.5, letter spacing 0.02em, black on white                                                                                                                |
| Page title                 | 40 px, weight 700, line height 1.1, letter spacing -0.02em                                                                                                                   |
| Lead paragraph             | 24 px, weight 600, line height 1.2                                                                                                                                           |
| Section heading            | 32 px, weight 700, letter spacing -0.01em                                                                                                                                    |
| Item heading               | 24 px, weight 700                                                                                                                                                            |
| Links                      | #333, weight 600, underlined                                                                                                                                                 |
| Rules                      | 1 px, #e5e5e5 between items; 1 px black under the header and over the footer                                                                                                 |
| Main button                | Black, white text, 10 px radius, underlined label                                                                                                                            |
| Second button              | The same shape with a 2 px black outline and no fill, as the main button looks on hover. Used for "Message Pedro to join part 1"                                             |
| Card for what matters most | #00599f with white text. Used for "Pedro has passed Miño"                                                                                                                    |
| Quiet box                  | #e0f0fa. Used for "You can see Pedro on a map"                                                                                                                               |
| Notice                     | 2 px black outline. Used for "Dates in Spain might change by 1 day"                                                                                                          |
| Page gutter                | 16 px at phone width                                                                                                                                                         |

Two highlight colours come from the print colours in Pedro's logo, and each has one meaning. Yellow (#ff0) means now: "Today". Cyan (#0ff) means an invitation: "You can join". Both sit behind black text and both always carry their words.

The site is drawn for a phone first: 390 px wide, working down to 320 px. On a larger screen it follows the blog's own wider layout.

Text contrast is at least 7 to 1 everywhere as drawn. Touch targets are at least 44 px. Reduced-motion settings are respected. Colour never carries meaning by itself.

No dark scheme is drawn, because the blog has none. The tech spec decides whether Fifty adds one.

One thing moves: the marker travelling down the route as the reader scrolls. Nothing else is animated.

Photos are Pedro's own. Until there are photos, pages are typographic.

Two other directions stay on the canvas as a record and are not being taken further: A, a printed walking guide set in Baskerville, and B, dark trail signage with the Camino's yellow arrow. A third idea, the pilgrim passport as a grid of ink stamps, was dropped before it was drawn. Pedro's organisation has a default design system, Astryx; it could not be read from this session and is not used.

### Where the canvas and this brief differ

The canvas was drawn before the decisions of 17 November. Where the two differ, this brief wins.

| On the canvas                                                                                                                          | What this brief says                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Under the first button: "This opens WhatsApp or email with the day filled in" and "Se abre WhatsApp o tu correo con el día ya escrito" | The button opens an email. Nothing opens WhatsApp                                                                           |
| All four boards show a guest's screen: the buttons, and on Day 12 the kilometres, the clock time, the progress bar and the map box     | The public's screens are not drawn. They have no buttons. On Day 12 they show the last place passed and the part of the day |
| The boards are set in Inter, which the export packs                                                                                    | No font file is shipped. Each phone uses its own sans-serif, so lines will break in slightly different places               |
| The footer is the blog's: LinkedIn, GitHub, Bluesky, the blog's feed, `hola@pataruco.dev` and an "Updated on" line                     | Fifty's own footer. See "On every page"                                                                                     |
| The reader's own time is named by country: "(1:32pm in the UK)" and "(8:32 a. m. en Venezuela)"                                        | It is called "your time" and "tu hora". The site never names the reader's country                                           |
| A number and its unit break across lines: "20" then "km", "1" then "day"                                                               | A number and its unit stay on one line                                                                                      |
| The link on a one-line entry title is about 26 px tall                                                                                 | Touch targets are at least 44 px                                                                                            |

Not drawn yet: the change-of-plan notice, a day page with its travel log, the trail page, Walk with me and the journal.

An automated accessibility check of the four boards of direction D, with the WCAG AAA rules switched on, found nothing on 17 November 2026. It ran on the boards' markup without Inter and without the logo, and it tests only what a rule can test.

## Rehearsals and dates

Training walks are the test plan. Each proves one more piece, and each is written up as a journal entry.

| Rehearsal | What it proves                                                                                                                                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | A check-in from a field with one bar of signal, and one with none that arrives later. Sent from OwnTracks with one hand: if that takes more than ten seconds, the trail page gets its own button                                                    |
| 2         | A journal entry written with no signal, then published from the phone on a connection slowed to the worst the walk will see, photos included, in both languages. Airplane mode goes on halfway through a photo, and the photo carries on afterwards |
| 3         | The tracker app running for a whole walking day: battery used, gaps in the trail                                                                                                                                                                    |
| 4         | A friend with the invite link finds Pedro on the day and reaches him by text. Pedro first checks that his phone does not hide texts from people who are not in his contacts                                                                         |
| 5         | Someone without the link confirms they cannot see the map, the distance or the time. The same check then runs by itself every time the site is deployed                                                                                             |
| 6         | Dress rehearsal: walk Day 1, Reading to Silchester, with the site switched to On the Way                                                                                                                                                            |
| 7         | The plan slips: Pedro posts a notice and changes today's stage from the phone. The day's page then shows what he did, with the plan underneath                                                                                                      |
| 8         | Pedro signs in to the trail page from a borrowed phone                                                                                                                                                                                              |
| 9         | The Book: a training weekend is saved as files and opened with no network                                                                                                                                                                           |

| When            | What                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| Spring 2027     | Invitation pages and the trail page built. First rehearsals                       |
| Around May 2027 | Ferry bookings open. Spanish dates stop being provisional                         |
| Summer 2027     | The invitation goes out, once the ferry is booked                                 |
| February 2028   | Reminder to book flights, as the itinerary already plans                          |
| 23 April 2028   | Freeze. The code does not change after this. Words, photos and positions still do |
| 7 May 2028      | On the Way                                                                        |
| June 2028       | Frozen into The Book                                                              |

## Deliberately left out

Comments and reactions. A sign-up form and a list of who is coming. Accounts and passwords. Kit, budget and training plan pages. A street map on public pages. Push notifications and email digests: a feed, and one relative who shares the link in the chat the family already uses, whichever app that is, do that job. WhatsApp: Pedro does not use it, because it is a Meta product, so the site never links to it and nothing depends on him posting there. Analytics beyond a simple count of visits. A native app. Guessing the reader's language from where they are.

## Corrections to carry back into the itinerary

Checking the site's content against the project documents turned up four things that should be fixed before any date or figure is published.

2028 is not a Holy Year. 25 July 2028 is a Tuesday. The Holy Year is 2027, and the next are 2032 and 2038. The site should not mention a Holy Door, and the budget's Holy Year premium probably does not apply.

The total distance does not add up. The itinerary says about 437 km on foot. Its own stages add up to about 306 km, and its three legs to 319 km. The site says "about 315 km" (110 + 115 + 90) until the distance is measured from the route files, and from then on every distance on the site is computed from those files, not typed.

Day 11 is longer than written. The itinerary gives 15 km from Ferrol to Neda and 22 km to Pontedeume. Neda to Pontedeume is another 16 km, which makes Ferrol to Pontedeume about 30 km: the longest day of the Camino Inglés, not Day 13. The usual guide splits Ferrol to Santiago into six stages; the itinerary allows five walking days. Either Day 11 is a 30 km day, or the Spanish dates move by one. That decides when to tell people to be in Santiago, so it should be settled before the invitation goes out.

Day 10 is longer than written. The itinerary takes the coastal train from Santander to Ferrol in 6 to 8 hours. By train it is nearer 14 hours, with a change in Oviedo. A bus takes about 8. On the 2025 timetable the ferry leaves Portsmouth at 21:30 on Monday and reaches Santander at 08:00 on Wednesday, so a bus that day is realistic and the train probably is not. The site says "a bus or train" until this is settled, and the 2028 timetable is not published yet.

## Open questions for Pedro

Is Fifty a section of pataruco.dev, or does it have its own address?

Which phone will be carried? It changes what the trail page and the tracker app can do.

Should people be invited onto the ferry? Part 2 is drawn with an invitation because every part has one. It is the easiest of the four to take out.

Where are most Spanish readers? The canvas assumes Venezuela for time zones and wording.

Should search engines be kept out, as assumed?

Is there already a Contentful account to use? The free plan allows one organisation per person and one space, and that space may already hold another site.

May companions appear in photos on a public page, or should the rule be to ask each time?

"Journal entry" or "postcard"? The brief says "journal entry" on the page and keeps "postcard" in the code. One word for both would be simpler.

Which relative shares each new entry in the family chat? The site sends no notifications, so this is how most of the family will hear about one.

Which kind of address do the buttons write to: a Hide My Email address, which looks random, or a named address on pataruco.dev?

## For the tech spec

The spec has to settle, at least: whether Fifty is built into the blog's repository and stack (vanilla Web Components, Vite, a TypeScript build script, static hosting) or stands alone; where the site is hosted, given that check-ins, the invite link and the tracker need something that is not static; how pages are made on request from the site's own copy, how the last good copy of each page is kept and shown when something fails, and how The Book is made from the same pages; how the season is worked out, and how Pedro overrides it for his own device; where journal entries, check-ins, notices and the live trail are stored, and for how long; how the site passes photos on to Contentful, in which sizes they are served, and whether readers' browsers fetch them from Contentful or through the site; how the trail page works with no signal, how it sends words first and photos in pieces that carry on, and what it shows while things wait; how Pedro signs in, and how he signs in from another device; how the invite link marks a guest without an account, how long that mark lasts (it has to survive from summer 2027 to the end of May 2028), and how a guest page is kept out of every cache, with a test on each deploy; how OwnTracks posts are received and checked; the Contentful content model in two locales for what is written at a desk, whether the words of the itinerary belong there, and how each change reaches the site's own copy; where the route files for the three paths come from, and how a position is matched to the last named place passed and to a distance along the route; how the travel log is kept for each day, and how a day page shows it against the plan; how the status refresh is stopped, and how often it runs; how two languages are built, including whether Spanish pages get Spanish addresses, how times are kept in UTC and shown on the reader's device in its own locale and time zone, how ages such as "40 minutes ago" stay right between refreshes, and how each page points to its counterpart; budgets for page weight and for requests per page; tests, including accessibility checks and the nine rehearsals; cost per month.

## Sources

- [pataruco.dev blog](https://pataruco.dev/blog/) and its source, [github.com/pataruco/blog](https://github.com/pataruco/blog): `src/styles/index.css`, the header, footer and post components, and `public/logo.svg`
- [WebKit bug 193946: geolocation in the background](https://bugs.webkit.org/show_bug.cgi?id=193946), closed as "later" on 4 November 2025
- [OwnTracks booklet: HTTP mode](https://owntracks.org/booklet/tech/http/)
- [Contentful: Free plan FAQs](https://contentful.com/help/free-plan-faqs)
- [Contentful: usage limits, January 2026](https://www.contentful.com/help/usage-limits-january-2026/)
- [Contentful: technical limits](https://www.contentful.com/developers/docs/technical-limits-2025/)
- [Contentful: Images API](https://www.contentful.com/developers/docs/references/images-api/images)
- [Salesforce signs definitive agreement to acquire Contentful, 22 January 2026](https://www.salesforce.com/news/press-releases/2026/01/22/salesforce-signs-definitive-agreement-to-acquire-contentful/)
- [CaminoWays: Camino Holy Year 2027](https://caminoways.com/camino-holy-year)
- [Albergues Camino Santiago: stages of the Camino Inglés](https://www.alberguescaminosantiago.com/camino-ingles/guia-etapas/)
- [Caminos: UK to Spain combined ferry timetable, 2025 sailings](https://www.caminos.co.uk/uk-spain-combined-ferry-timetable)
- [Rome2Rio: Santander to Ferrol](https://www.rome2rio.com/s/Santander/Ferrol)
- [Contentful: web app overview, supported browsers](https://www.contentful.com/help/getting-started/contentful-web-app-overview/)
- [Contentful: Upload API](https://contentful.com/developers/docs/references/content-management-api/uploads/llms.txt)
- [WebKit bug 201866: Background Sync for Safari on iOS](https://bugs.webkit.org/show_bug.cgi?id=201866), still open on 17 November 2026
- [Maximiliano Firtman: iOS PWA compatibility](https://firt.dev/notes/pwa-ios/)
- [OwnTracks booklet: location and modes](https://owntracks.org/booklet/features/location/)
- [Apple: Hide My Email with iCloud+](https://support.apple.com/guide/icloud/what-you-can-do-with-icloud-and-hide-my-email-mme38e1602db/icloud)
- [Apple: screen and filter text messages on iPhone](https://support.apple.com/guide/iphone/screen-and-filter-texts-iph203ab0be4/ios)
- Project documents: `st-james-pilgrimage-2028.md`, `camino-kit-checklist.md`
