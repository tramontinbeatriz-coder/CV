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

/**
 * Photos are optional. The site is designed to work without them;
 * add `cover` / `gallery` to a project (or `portrait` to hero/about) and they render automatically.
 * See docs/CONCEPT.md §11 for what each photo should show.
 */
export type ImageSlot = {
  /** Path under /public, e.g. "images/innovation-tournament/stage.jpg" */
  src: string;
  alt: string;
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
  cover?: ImageSlot;
  gallery?: ImageSlot[];
};

export const person = {
  name: 'Beatriz Tramontin',
  shortName: 'Bia',
  monogram: 'BT',
  role: 'Strategy, innovation & communication',
  location: 'Porto Alegre, Brazil',
  links: {
    linkedin: { href: 'https://www.linkedin.com/in/beatriz-tramontin', label: 'LinkedIn' },
    email: { href: 'mailto:tramontinbeatriz@gmail.com', label: 'tramontinbeatriz@gmail.com' },
  },
};

export const seo = {
  title: 'Beatriz Tramontin — Strategy, innovation & communication',
  description:
    'Beatriz (Bia) Tramontin is a Business AI Solution Advisor at SAP and co-lead of the SAP Latin America Innovation Tournament, connecting strategy, technology, communication and people across Latin America.',
};

export const nav = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#how-i-work', label: 'How I work' },
  { href: '#contact', label: 'Contact' },
];

/* ───────────────────────── 01 · HERO ───────────────────────── */

export const hero = {
  eyebrow: 'Strategy · Innovation · Communication · Technology',
  headline: 'I turn ideas into things that *happen.*',
  intro:
    'I’m Beatriz — Bia, to most people. At SAP I work in Business AI, connecting technology, business and the people who need to move both forward. Trained in International Relations, I do my best work between countries, teams and disciplines.',
  ctas: {
    primary: { href: '#work', label: 'View my work' },
    secondary: { href: '#about', label: 'About me' },
  },
  status: [
    { label: 'Currently', value: 'Business AI Solution Advisor, SAP' },
    { label: 'Co-leading', value: 'SAP Latin America Innovation Tournament' },
    { label: 'Based in', value: 'Porto Alegre · open to relocation' },
  ],
  portrait: undefined as ImageSlot | undefined,
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
    'At Global Jr. ESPM I led consulting projects on internationalization strategy for Brazilian companies. Then came SAP’s Open Innovation program, where I spent two years connecting startups and enterprises across Latin America — 300+ startups and corporate partners, 30+ collaborations. Today I’m a Business AI Solution Advisor at SAP: coordinating cross-functional projects, running workshops and presenting strategic recommendations to enterprise clients, and making sure sales, product and technical teams are moving towards the same outcome.',
    'Technology is a real part of what I do, and I enjoy it. But what I bring is the connection — translating complex ideas into decisions, turning conversations into plans, and getting people from different countries and functions to move in the same direction. It’s also why I’m doing a postgraduate degree in Digital Communication & Business Intelligence: the story matters as much as the data.',
  ],
  quote: 'Most of my work is translation — between technology and business, between teams, between countries.',
  path: [
    { step: '01', title: 'International Relations', detail: 'ESPM. How systems, cultures and interests connect.', when: '2021–25' },
    { step: '02', title: 'Global Jr. ESPM', detail: 'Project Director. Internationalization strategy and market research for Brazilian companies.', when: '2021–22' },
    { step: '03', title: 'SAP Open Innovation', detail: 'Connecting startups and enterprises across Latin America.', when: '2023–25' },
    { step: '04', title: 'SAP Business AI', detail: 'Solution Advisor. Co-lead, Latin America Innovation Tournament.', when: 'Now' },
    { step: '05', title: 'Digital Communication & BI', detail: 'Postgraduate studies, ESPM. Where data meets the story.', when: '2025–27' },
  ],
  facts: [
    { label: 'Now', value: 'Business AI Solution Advisor, SAP' },
    { label: 'Education', value: 'BA International Relations, ESPM' },
    { label: 'Studying', value: 'Postgrad, Digital Communication & Business Intelligence, ESPM' },
    { label: 'Languages', value: 'Portuguese (native) · English (fluent) · Spanish (advanced)' },
    { label: 'Based in', value: 'Porto Alegre, Brazil · open to relocation' },
    { label: 'Independent', value: 'Co-founder, Nós' },
  ],
  portrait: undefined as ImageSlot | undefined,
};

/* ───────────────────────── 03 · SELECTED WORK ───────────────────────── */

export const work = {
  number: '02',
  label: 'Selected work',
  headline: 'Complex things, *given structure.*',
  lede: 'Five projects, one pattern: take something with many moving parts, give it a shape, and get people moving with it.',
};

export const projects: Project[] = [
  {
    slug: 'innovation-tournament',
    index: '01',
    title: 'Innovation Tournament',
    kicker: 'Strategy · Program management · Innovation',
    tagline: 'SAP’s Latin America innovation program — four countries, owned end to end.',
    meta: [
      { label: 'Role', value: 'Co-Lead · end-to-end execution' },
      { label: 'Countries', value: 'Argentina · Brazil · Colombia · Mexico' },
      { label: 'Organisation', value: 'SAP Latin America' },
      { label: 'Since', value: 'June 2025' },
    ],
    context:
      'The SAP Latin America Innovation Tournament is a multinational innovation program running in Argentina, Brazil, Colombia and Mexico at the same time — bringing together participants, mentors and judges around real projects, with local teams and stakeholders in each market.',
    role:
      'As co-lead, I own execution end to end: from program design and prioritisation to coordinating people across countries and running the evaluation process.',
    challenge:
      'Make a single program work in four countries at once — each with its own teams, timelines and priorities — while coordinating a large network of mentors, judges and participants and keeping the quality bar consistent across more than twenty projects.',
    actions: [
      'Coordinated mentors, judges and 20+ participants across four countries.',
      'Aligned multi-country teams and stakeholders around one timeline and a shared set of strategic priorities.',
      'Designed the program structure and kept iterating on it with a test-and-learn approach — improving participation and outcomes.',
      'Managed the evaluation process: 20+ projects reviewed, with consistent, quality selection criteria.',
      'Facilitated collaboration between teams, strengthening engagement and the growth of innovative solutions in the region.',
      'Drove high-impact innovation initiatives within the program.',
    ],
    impact:
      '+120% growth in acquisition and engagement — and a program format that got better while it was running, with stronger participation and outcomes.',
    metrics: [
      { value: '+120%', label: 'growth in acquisition & engagement' },
      { value: '4', label: 'Latin American countries' },
      { value: '20+', label: 'projects evaluated' },
    ],
    skills: ['Strategy', 'Project management', 'Innovation', 'Stakeholder management', 'International coordination', 'Evaluation & selection', 'Facilitation'],
    pullQuote: 'From the outside it looked like an event. From the inside, it was a strategy and project management problem in four countries.',
  },
  {
    slug: 'sap-business-ai',
    index: '02',
    title: 'SAP Business AI',
    kicker: 'Technology · Client engagement · Strategy',
    tagline: 'Translating AI into conversations — and initiatives — that make sense for the business.',
    meta: [
      { label: 'Role', value: 'Business AI Solution Advisor' },
      { label: 'Company', value: 'SAP' },
      { label: 'Clients', value: 'Enterprise, Latin America' },
      { label: 'Since', value: 'January 2025' },
    ],
    context:
      'SAP works with enterprise companies that are deciding how AI fits into their business. My work sits between those clients and the sales, product and technical teams behind the solutions.',
    role:
      'I’m a key point of contact between clients and internal teams — coordinating cross-functional projects, running workshops and presentations, and keeping business objectives, stakeholders and delivery timelines aligned.',
    challenge:
      'AI is complex, fast-moving and easy to overpromise. The work is making it concrete — what it means for a specific business, which problem it solves, and what it takes to get there.',
    actions: [
      'Lead the coordination of cross-functional projects, aligning business objectives, stakeholders and delivery timelines.',
      'Deliver client-facing presentations, workshops and strategic recommendations to enterprise clients.',
      'Act as a key point of contact between clients and internal teams — managing expectations and keeping everyone updated.',
      'Manage multiple parallel initiatives in a fast-paced environment: prioritising, and mitigating risks early.',
      'Work with sales, product and technical teams to make sure initiatives are executed well.',
      'Spot process improvements that make project execution more efficient.',
    ],
    impact:
      'The value I add is translation: making complex technology clear for the people who need to decide on it — and making business needs clear for the people who build it.',
    metrics: [
      { value: '3', label: 'teams aligned — sales, product & technical' },
    ],
    skills: ['AI business solutions', 'Client engagement', 'Workshop facilitation', 'Strategic recommendations', 'Cross-functional coordination', 'Risk & priority management', 'SAP ecosystem'],
    pullQuote: 'The hardest part of AI is rarely the technology. It’s the conversation around it.',
  },
  {
    slug: 'sap-open-innovation',
    index: '03',
    title: 'SAP Open Innovation',
    kicker: 'Ecosystem · Partnerships · Innovation',
    tagline: 'Connecting startups and enterprises across Latin America — and turning introductions into collaborations.',
    meta: [
      { label: 'Role', value: 'Open Innovation Intern' },
      { label: 'Company', value: 'SAP' },
      { label: 'Region', value: 'Latin America' },
      { label: 'Period', value: '2023–2025' },
    ],
    context:
      'SAP’s Open Innovation program connects startups and enterprises across Latin America, so large companies can find emerging technologies and startups can find real customers.',
    role:
      'I supported the program across the whole ecosystem: engaging startups and corporate partners, identifying emerging technologies, and building relationships with innovation hubs.',
    challenge:
      'An ecosystem is only useful if the right people meet at the right moment. The work is knowing who is building what, understanding what corporates actually need, and making the connection worth everyone’s time.',
    actions: [
      'Engaged with 300+ startups and corporate partners to identify emerging technologies.',
      'Contributed to 30+ startup–corporate collaborations and innovation initiatives.',
      'Built relationships with key ecosystem hubs such as Cubo Itaú and Distrito.',
      'Supported SAP’s Open Innovation program across Latin America.',
    ],
    impact:
      '30+ startup–corporate collaborations — and relationships across the Latin American innovation ecosystem, including hubs like Cubo Itaú and Distrito.',
    metrics: [
      { value: '300+', label: 'startups & corporate partners engaged' },
      { value: '30+', label: 'startup–corporate collaborations' },
      { value: '2', label: 'years in the Latin American ecosystem' },
    ],
    skills: ['Open innovation', 'Ecosystem & partnerships', 'Market research', 'Relationship building', 'Emerging technologies'],
    pullQuote: 'Innovation is mostly introductions — the right people, at the right moment, with a reason to work together.',
  },
  {
    slug: 'nos',
    index: '04',
    title: 'Nós',
    kicker: 'Independent project · Community · Brand',
    tagline: 'A community and in-person experience for women in Porto Alegre — co-founded and built from an idea.',
    meta: [
      { label: 'Role', value: 'Co-founder' },
      { label: 'Where', value: 'Porto Alegre metropolitan region' },
      { label: 'Founded', value: 'January 2026' },
      { label: 'Partners', value: '4 local partners' },
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
      'Founded in January 2026, Nós has already run four events, reached 60 women and built four partnerships across the Porto Alegre metropolitan region — an idea that became a real experience, with its own community and brand.',
    metrics: [
      { value: '4', label: 'events since January 2026' },
      { value: '60', label: 'women reached' },
      { value: '4', label: 'partners in the Porto Alegre region' },
    ],
    skills: ['Entrepreneurship', 'Community building', 'Brand strategy', 'Experience design', 'Partnerships', 'Content & communication'],
    pullQuote: 'An idea only counts once people show up for it.',
  },
  {
    slug: 'across-borders',
    index: '05',
    title: 'Across borders',
    kicker: 'International · Cross-functional · Stakeholders',
    tagline: 'Coordinating initiatives between countries, teams and cultures — mostly across Latin America and the Americas.',
    meta: [
      { label: 'Role', value: 'Coordination & stakeholder management' },
      { label: 'Regions', value: 'Latin America & the Americas' },
      { label: 'Languages', value: 'Portuguese · English · Spanish' },
      { label: 'Since', value: '2021' },
    ],
    context:
      'Much of my work happens across markets: different countries, different teams, different ways of working — and one shared outcome to deliver.',
    role:
      'I’m usually the person in the middle — coordinating initiatives that involve several countries, teams and stakeholders, and keeping them aligned.',
    challenge:
      'Distance is the easy part. The real work is alignment: different priorities, cultures and communication styles moving on the same timeline.',
    actions: [
      'Coordinated multi-country teams and stakeholders on the SAP Latin America Innovation Tournament — Argentina, Brazil, Colombia and Mexico.',
      'Connected startups and corporates across Latin America in SAP’s Open Innovation program (300+ engaged).',
      'Led consulting projects on internationalization strategy for Brazilian companies at Global Jr. ESPM — market research and strategic analysis for global expansion.',
      'Worked in Portuguese, English and Spanish, adapting to different cultures, functions and audiences.',
    ],
    impact:
      'Initiatives that hold together across borders — from helping Brazilian companies plan their expansion abroad to running one innovation program in four countries at once.',
    metrics: [
      { value: '4', label: 'countries in a single program' },
      { value: '3', label: 'working languages' },
      { value: '300+', label: 'startups & partners across Latin America' },
    ],
    skills: ['International coordination', 'Stakeholder management', 'Internationalization strategy', 'Market research', 'Cross-cultural communication', 'Project management'],
    pullQuote: 'Distance is the easy part. Alignment is the work.',
  },
];

/** Regions shown in the "Across borders" visual on the home page. */
export const borders = {
  headline: 'Four countries. One program. *Many ways of working.*',
  body: 'Three languages, many markets, one shared outcome. Most of what I coordinate crosses at least one border — of country, of team, or of discipline.',
  regions: [
    {
      name: 'Latin America',
      note: 'Innovation Tournament · Open Innovation',
      places: ['Argentina', 'Brazil', 'Colombia', 'Mexico'],
    },
    {
      name: 'Global',
      note: 'Internationalization consulting',
      places: ['Expansion strategy for Brazilian companies', 'Global Jr. ESPM, 2021–22'],
    },
    {
      name: 'Languages',
      note: 'Working languages',
      places: ['Portuguese — native', 'English — fluent', 'Spanish — advanced'],
    },
  ],
  across: ['Clients', 'Sales', 'Product', 'Technical', 'Startups', 'Corporates', 'Mentors', 'Judges', 'Participants'],
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
      proof: 'Defining priorities for a program running in four countries at once. Internationalization strategy and market research at Global Jr. ESPM.',
    },
    {
      n: '02',
      title: 'Innovation',
      line: 'Exploring new ways to solve problems and create value.',
      proof: '300+ startups and corporate partners engaged in SAP’s Open Innovation program. Test-and-learn on a live program.',
    },
    {
      n: '03',
      title: 'Communication',
      line: 'Connecting people, ideas and business needs.',
      proof: 'Workshops and strategic recommendations for enterprise clients. Building the voice and brand of Nós. A postgrad in Digital Communication.',
    },
    {
      n: '04',
      title: 'Execution',
      line: 'Moving projects from concept to reality.',
      proof: 'Multiple parallel initiatives at SAP, managed for risk and priority. Nós: from an idea to four events and 60 women in its first months.',
    },
  ],
};

/* ───────────────────────── 05 · CONTACT ───────────────────────── */

export const contact = {
  number: '04',
  label: 'Contact',
  headline: 'Let’s build something *interesting.*',
  lede:
    'I’m open to conversations about strategic projects, innovation, growth and product, brand and product marketing, communications, and international work — especially where technology and people meet. Based in Porto Alegre, open to relocation.',
  copyLabel: 'Copy email',
  copiedLabel: 'Copied',
};

export const footer = {
  line: 'Strategy, innovation & communication — across borders.',
  backToTop: 'Back to top',
};
