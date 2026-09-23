/**
 * Single source of truth for all copy on the site.
 *
 * Conventions used in strings (rendered by `rich()` in src/lib/rich.ts):
 *   *text*    → italic serif accent
 *   [[text]]  → PLACEHOLDER — information Beatriz still needs to provide.
 *               Rendered with a visible highlight so nothing ships by accident.
 *               Search the repo for "[[" to find every one of them.
 */

export type Metric = {
  value: string;
  label: string;
  /** true when the number itself is still unknown */
  placeholder?: boolean;
};

export type ImageSlot = {
  /** Path under /public, e.g. "images/innovation-tournament/stage.jpg". Leave empty to show a placeholder. */
  src?: string;
  alt: string;
  /** What the photo should show — shown on the placeholder until a real image is added. */
  brief: string;
  ratio?: '16/9' | '4/3' | '3/4' | '1/1' | '3/2' | '21/9';
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  tagline: string;
  meta: { label: string; value: string }[];
  context: string;
  role: string;
  challenge: string;
  actions: string[];
  impact: string;
  metrics: Metric[];
  skills: string[];
  pullQuote: string;
  cover: ImageSlot;
  gallery: ImageSlot[];
};

export const person = {
  name: 'Beatriz Tramontin',
  shortName: 'Bia',
  monogram: 'BT',
  role: 'Strategy, innovation & communication',
  location: '[[City, Country]]',
  links: {
    linkedin: { href: 'https://www.linkedin.com/in/[[your-profile]]', label: 'LinkedIn', placeholder: true },
    email: { href: 'mailto:[[your@email.com]]', label: '[[your@email.com]]', placeholder: true },
  },
};

export const seo = {
  title: 'Beatriz Tramontin — Strategy, innovation & communication',
  description:
    'Beatriz (Bia) Tramontin works in Business AI and innovation at SAP, connecting strategy, technology, communication and people across Latin America and the Americas.',
};

export const nav = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#how-i-work', label: 'How I work' },
  { href: '#beyond', label: 'Beyond work' },
  { href: '#contact', label: 'Contact' },
];

/* ───────────────────────── 01 · HERO ───────────────────────── */

export const hero = {
  eyebrow: 'Strategy · Innovation · Communication · Technology',
  headline: 'I turn ideas into things that *happen.*',
  intro:
    'I’m Beatriz — Bia, to most people. I work in Business AI and innovation at SAP, connecting technology, business and the people who need to move both forward. Trained in International Relations, I do my best work between countries, teams and disciplines.',
  ctas: {
    primary: { href: '#work', label: 'View my work' },
    secondary: { href: '#about', label: 'About me' },
  },
  status: [
    { label: 'Currently', value: 'Business AI & Innovation at SAP' },
    { label: 'Working across', value: 'Latin America & the Americas' },
    { label: 'Also', value: 'Co-founder of Nós' },
  ],
  portrait: {
    alt: 'Portrait of Beatriz Tramontin',
    brief:
      'Editorial portrait, natural light, neutral background (ivory, stone or concrete). Half-body, relaxed posture, looking at camera or slightly off. No corporate backdrop, no badge.',
    ratio: '3/4',
  } satisfies ImageSlot,
};

/* ───────────────────────── 02 · ABOUT ───────────────────────── */

export const about = {
  number: '01',
  label: 'About',
  headline: 'A career built in the *spaces between.*',
  lede:
    'International Relations taught me how different systems learn to work together. I’ve been doing that ever since — with a lot more technology involved.',
  paragraphs: [
    'I studied International Relations at ESPM: a degree about how countries, institutions and people with different interests find common ground. It turned out to be excellent training for innovation work, where the hard part is rarely the idea — it’s getting everyone to build it together.',
    'From there my path moved into technology and innovation, and to SAP, where I work with Business AI. My days sit where strategic projects, client conversations and cross-team coordination meet: running workshops, presenting AI solutions to clients, and making sure business, product and technology teams are moving towards the same outcome.',
    'Technology is a real part of what I do, and I enjoy it. But what I bring is the connection — translating complex ideas into decisions, turning conversations into plans, and getting people from different countries and functions to move in the same direction.',
  ],
  quote: 'Most of my work is translation — between technology and business, between teams, between countries.',
  path: [
    { step: '01', title: 'International Relations', detail: 'ESPM. How systems, cultures and interests connect.', when: '[[Year]]' },
    { step: '02', title: 'Technology & innovation', detail: 'From understanding systems to building new things with them.', when: '[[Year]]' },
    { step: '03', title: 'SAP', detail: 'Strategic projects, clients and stakeholders across markets.', when: '[[Year]]' },
    { step: '04', title: 'Business AI', detail: 'Translating AI into business conversations and initiatives.', when: 'Now' },
  ],
  facts: [
    { label: 'Education', value: 'International Relations, ESPM' },
    { label: 'Now', value: 'Business AI & Innovation, SAP' },
    { label: 'Regions', value: 'Latin America & the Americas' },
    { label: 'Languages', value: '[[e.g. Portuguese, English, Spanish]]' },
    { label: 'Independent', value: 'Co-founder, Nós' },
  ],
  portrait: {
    alt: 'Beatriz at work',
    brief:
      'Candid photo of you mid-conversation — facilitating, presenting or in a working session. Shows you in action rather than posing. Landscape or portrait both work.',
    ratio: '4/3',
  } satisfies ImageSlot,
};

/* ───────────────────────── 03 · SELECTED WORK ───────────────────────── */

export const work = {
  number: '02',
  label: 'Selected work',
  headline: 'Complex things, *given structure.*',
  lede: 'Three projects, one pattern: take something with many moving parts, give it a shape, and get people moving with it.',
};

export const projects: Project[] = [
  {
    slug: 'innovation-tournament',
    index: '01',
    title: 'Innovation Tournament',
    kicker: 'Strategy · Program management · Innovation',
    tagline: 'One innovation program, four Latin American countries, run end to end.',
    meta: [
      { label: 'Role', value: 'Led end-to-end execution' },
      { label: 'Scope', value: '4 countries, Latin America' },
      { label: 'Organisation', value: '[[Organisation]]' },
      { label: 'Year', value: '[[Year]]' },
    ],
    context:
      'A multinational innovation program running across four Latin American countries at the same time — bringing together participants, mentors and judges around real projects, with local teams and stakeholders in each market.',
    role:
      'I led execution end to end: from planning and prioritisation to coordinating people across countries and evaluating the final projects.',
    challenge:
      'Make a single program work in four countries at once — each with its own teams, timelines and priorities — while coordinating a large network of mentors, judges and participants and keeping the quality bar consistent across more than twenty projects.',
    actions: [
      'Coordinated mentors, judges and participants across four countries.',
      'Aligned international teams and stakeholders around one timeline and a shared set of strategic priorities.',
      'Structured the program and kept improving it with a test-and-learn approach: try, measure, adjust.',
      'Facilitated collaboration between different teams and functions.',
      'Evaluated 20+ projects.',
      'Developed high-impact innovation initiatives within the program.',
    ],
    impact:
      '+120% growth in acquisition and engagement — and a program format that got better while it was running, not only after it ended.',
    metrics: [
      { value: '+120%', label: 'growth in acquisition & engagement' },
      { value: '4', label: 'Latin American countries' },
      { value: '20+', label: 'projects evaluated' },
    ],
    skills: ['Strategy', 'Project management', 'Innovation', 'Stakeholder management', 'International coordination', 'Facilitation'],
    pullQuote: 'From the outside it looked like an event. From the inside, it was a strategy and project management problem in four countries.',
    cover: {
      alt: 'Innovation Tournament — participants during the program',
      brief:
        'Wide shot of the program in action: stage or opening moment with participants in the room. Real energy, real people. Ideally shows scale (a full room, several teams).',
      ratio: '16/9',
    },
    gallery: [
      {
        alt: 'Mentors working with a participating team',
        brief: 'Mentors working with a team: close, candid, hands on laptops / post-its. Shows the program as work, not just stage.',
        ratio: '4/3',
      },
      {
        alt: 'Judges evaluating projects',
        brief: 'Judging moment or pitch: a team presenting, judges listening. Captures the 20+ projects evaluated.',
        ratio: '4/3',
      },
      {
        alt: 'Behind the scenes — planning',
        brief: 'Behind the scenes: you coordinating (on a call, with the timeline or planning board). Blur anything confidential.',
        ratio: '3/4',
      },
      {
        alt: 'Group photo with teams from different countries',
        brief: 'Group photo with teams/mentors from the different countries — the multinational side of the program.',
        ratio: '3/4',
      },
    ],
  },
  {
    slug: 'sap-business-ai',
    index: '02',
    title: 'SAP Business AI',
    kicker: 'Technology · Client engagement · Strategy',
    tagline: 'Translating AI into conversations — and initiatives — that make sense for the business.',
    meta: [
      { label: 'Role', value: '[[Exact job title]]' },
      { label: 'Company', value: 'SAP' },
      { label: 'Focus', value: 'Business AI & innovation' },
      { label: 'Since', value: '[[Year]]' },
    ],
    context:
      'SAP works with companies that are deciding how AI fits into their business. My work sits between those clients, the business, and the product and technology teams behind the solutions.',
    role:
      'I connect technology, strategy and business needs: engaging clients, running workshops and presentations, and coordinating the teams that need to deliver.',
    challenge:
      'AI is complex, fast-moving and easy to overpromise. The work is making it concrete — what it means for a specific business, which problem it solves, and what it takes to get there.',
    actions: [
      'Engage with clients around AI solutions and what they can mean for their business.',
      'Run workshops that help clients explore AI in the context of their own operations.',
      'Build and deliver client presentations on AI solutions.',
      'Work on strategic projects and innovation initiatives.',
      'Coordinate across business, product and technology teams.',
    ],
    impact:
      'The value I add is translation: making complex technology clear for the people who need to decide on it — and making business needs clear for the people who build it. [[Add one concrete result here, e.g. a client initiative that moved forward, or feedback from a workshop.]]',
    metrics: [
      { value: '3', label: 'functions connected — business, product & technology' },
      { value: '[[#]]', label: 'client workshops run', placeholder: true },
      { value: '[[#]]', label: 'client presentations delivered', placeholder: true },
    ],
    skills: ['Business AI', 'Client engagement', 'Workshop facilitation', 'Presentations & storytelling', 'Strategic projects', 'Cross-functional coordination'],
    pullQuote: 'The hardest part of AI is rarely the technology. It’s the conversation around it.',
    cover: {
      alt: 'Beatriz facilitating an AI workshop',
      brief:
        'You facilitating a workshop or presenting to a room: whiteboard, post-its, people engaged. Avoid confidential slides, client logos and heavy SAP branding in frame.',
      ratio: '16/9',
    },
    gallery: [
      {
        alt: 'Workshop materials and outputs',
        brief: 'Detail shot of workshop outputs: sticky notes, sketched use cases, a canvas. Blur client names.',
        ratio: '4/3',
      },
      {
        alt: 'Cross-functional working session',
        brief: 'Working session with business, product and tech colleagues — the coordination side of the role.',
        ratio: '4/3',
      },
    ],
  },
  {
    slug: 'across-borders',
    index: '03',
    title: 'Across borders',
    kicker: 'International · Cross-functional · Stakeholders',
    tagline: 'Coordinating initiatives between countries, teams and cultures — mostly across Latin America and the Americas.',
    meta: [
      { label: 'Role', value: 'Coordination & stakeholder management' },
      { label: 'Regions', value: 'Latin America & the Americas' },
      { label: 'Languages', value: '[[Working languages]]' },
      { label: 'Period', value: '[[Years]]' },
    ],
    context:
      'Much of my work happens across markets: different countries, different teams, different ways of working — and one shared outcome to deliver.',
    role:
      'I’m usually the person in the middle — coordinating initiatives that involve several countries, teams and stakeholders, and keeping them aligned.',
    challenge:
      'Distance is the easy part. The real work is alignment: different priorities, cultures and communication styles moving on the same timeline.',
    actions: [
      'Coordinated initiatives involving multiple countries, teams and stakeholders.',
      'Worked with teams across Latin America and the Americas.',
      'Connected business, product and technology teams around shared goals.',
      'Adapted how I communicate to different cultures, functions and audiences.',
    ],
    impact:
      'Initiatives that hold together across borders — like an innovation program running in four countries at once. [[Add one or two more examples of international initiatives you coordinated.]]',
    metrics: [
      { value: '4', label: 'countries in a single program' },
      { value: '[[#]]', label: 'countries worked with', placeholder: true },
      { value: '[[#]]', label: 'working languages', placeholder: true },
    ],
    skills: ['International coordination', 'Stakeholder management', 'Cross-cultural communication', 'Cross-functional alignment', 'Project management'],
    pullQuote: 'Distance is the easy part. Alignment is the work.',
    cover: {
      alt: 'Working session with an international team',
      brief:
        'In-person moment with colleagues from other countries — a working session, an offsite, a trip. If nothing fits, a clean shot of a multi-country video call (names blurred).',
      ratio: '16/9',
    },
    gallery: [
      {
        alt: 'On location in another country',
        brief: 'You on location during a work trip — in context, not a tourist photo (office, venue, event).',
        ratio: '4/3',
      },
      {
        alt: 'Multicultural team',
        brief: 'Team photo with people from different countries you worked with.',
        ratio: '4/3',
      },
    ],
  },
];

/** Regions shown in the "Across borders" visual on the home page. */
export const borders = {
  headline: 'Four countries. One program. *Many ways of working.*',
  body: 'Different markets, different rhythms, one shared outcome. Most of what I coordinate crosses at least one border — of country, of team, or of discipline.',
  regions: [
    {
      name: 'Latin America',
      note: 'Innovation Tournament — 4 countries',
      places: ['[[Country 1]]', '[[Country 2]]', '[[Country 3]]', '[[Country 4]]'],
    },
    {
      name: 'The Americas',
      note: 'Teams, clients & stakeholders',
      places: ['[[Countries / markets]]'],
    },
  ],
  across: ['Business', 'Product', 'Technology', 'Clients', 'Mentors', 'Judges', 'Participants'],
};

/* ───────────────────────── 04 · HOW I WORK ───────────────────────── */

export const howIWork = {
  number: '03',
  label: 'How I work',
  headline: 'Four things I bring *to any project.*',
  lede: 'Not adjectives — habits. And where you can see them in practice.',
  pillars: [
    {
      n: '01',
      title: 'Strategy',
      line: 'Turning ideas into structured initiatives.',
      proof: 'Defining priorities and one shared timeline for a program running in four countries at once.',
    },
    {
      n: '02',
      title: 'Innovation',
      line: 'Exploring new ways to solve problems and create value.',
      proof: 'Improving a live program through test-and-learn — and helping clients explore what AI can do for their business.',
    },
    {
      n: '03',
      title: 'Communication',
      line: 'Connecting people, ideas and business needs.',
      proof: 'Translating AI into client workshops and presentations. Building the voice and brand of Nós.',
    },
    {
      n: '04',
      title: 'Execution',
      line: 'Moving projects from concept to reality.',
      proof: 'Mentors, judges, participants and 20+ projects, delivered end to end. A community built from an idea.',
    },
  ],
};

/* ───────────────────────── 05 · BEYOND WORK ───────────────────────── */

export const beyond = {
  number: '04',
  label: 'Beyond work',
  headline: 'The things I build *on my own time.*',
  lede: 'Same instincts, different setting: an idea, a community, and the work of making it real.',
};

export const nos: Project = {
  slug: 'nos',
  index: '04',
  title: 'Nós',
  kicker: 'Community · Brand · Experiences',
  tagline: 'A community and in-person experience for women in Porto Alegre — co-founded and built from an idea.',
  meta: [
    { label: 'Role', value: 'Co-founder' },
    { label: 'Where', value: 'Porto Alegre, Brazil' },
    { label: 'Founded', value: '[[Year]]' },
    { label: 'Follow', value: '[[@instagram-handle]]' },
  ],
  context:
      'Nós — Portuguese for both “us” and “knots” — is a community for women in Porto Alegre, built around in-person experiences, events and the connections that come out of them.',
  role:
    'As co-founder I work across the whole project: the experiences, the community, partnerships, the brand and the way it communicates.',
  challenge:
    'Take an idea and turn it into something people actually show up for — a brand, a community and a series of experiences — as an independent project, with no company behind it.',
  actions: [
    'Designing in-person experiences and events, end to end.',
    'Building and looking after the community.',
    'Creating partnerships that make the experiences possible.',
    'Shaping the brand: identity, tone and how Nós shows up.',
    'Communication and content across channels.',
    'Thinking through the audience experience — before, during and after each event.',
  ],
  impact:
    'An idea that became a real, recurring experience with its own community and brand. [[Add numbers: events held, women reached, partners, community size.]]',
  metrics: [
    { value: '[[#]]', label: 'events & experiences', placeholder: true },
    { value: '[[#]]', label: 'women reached', placeholder: true },
    { value: '[[#]]', label: 'partners', placeholder: true },
  ],
  skills: ['Entrepreneurship', 'Community building', 'Brand strategy', 'Experience design', 'Partnerships', 'Content & communication'],
  pullQuote: 'An idea only counts once people show up for it.',
  cover: {
    alt: 'A Nós event in Porto Alegre',
    brief:
      'The best photo of a Nós event: women together in the space, warm light, real moment. This is the hero image of the section — choose atmosphere over posed group shots.',
    ratio: '4/3',
  },
  gallery: [
    {
      alt: 'Nós brand identity',
      brief: 'Brand identity: logo, a few social posts or printed materials laid out together.',
      ratio: '1/1',
    },
    {
      alt: 'Event details',
      brief: 'Detail shot from an event: table setting, welcome kit, signage — the care in the experience.',
      ratio: '1/1',
    },
    {
      alt: 'Community moment',
      brief: 'Candid community moment: conversation, laughter, connection.',
      ratio: '1/1',
    },
  ],
};

export const interests = {
  label: 'Also on my mind',
  items: [
    { title: '[[Interest or creative project]]', note: '[[One line on why it matters to you.]]' },
    { title: '[[Interest or creative project]]', note: '[[One line on why it matters to you.]]' },
    { title: '[[Interest or creative project]]', note: '[[One line on why it matters to you.]]' },
  ],
};

/* ───────────────────────── 06 · CONTACT ───────────────────────── */

export const contact = {
  number: '05',
  label: 'Contact',
  headline: 'Let’s build something *interesting.*',
  lede:
    'I’m open to conversations about strategic projects, innovation, brand and product marketing, communications, and international work — especially where technology and people meet.',
  copyLabel: 'Copy email',
  copiedLabel: 'Copied',
};

export const footer = {
  line: 'Strategy, innovation & communication — across borders.',
  backToTop: 'Back to top',
};
