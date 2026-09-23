# Beatriz Tramontin — Portfolio

Personal portfolio: strategy, innovation, communication and technology.
Built with [Astro](https://astro.build) as a fully static site. The pages ship no JS framework, only ~2 KB of progressive-enhancement script.

- **Concept, copy, design system and placeholder list:** [`docs/CONCEPT.md`](docs/CONCEPT.md)
- **All site copy:** [`src/content/site.ts`](src/content/site.ts), the single file to edit.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview
```

## Component architecture

```
Base (layout)
├── Navigation            fixed nav, hide-on-scroll, full-screen mobile menu
├── <page>
│   ├── Hero
│   ├── About             → SectionHeader, Media
│   ├── SelectedWork      → SectionHeader
│   │   ├── ProjectCard   (variant: feature | row) → MetricRow → Metric, optional Media
│   │   └── AcrossBorders (international visual band)
│   ├── Pillars           (How I work)
│   └── Contact           → SectionHeader
│   ── or ──
│   └── CaseStudy         (every /work/[slug] page) → Media, MetricRow
└── Footer
```

## File structure

```
├── astro.config.mjs          site/base read from env (GitHub Pages)
├── docs/CONCEPT.md           full concept & design documentation
├── public/
│   ├── favicon.svg
│   └── images/               ← drop real photos here
└── src/
    ├── content/site.ts       ALL copy + project data (single source of truth)
    ├── lib/rich.ts           *italic* / [[placeholder]] rendering, url helpers
    ├── layouts/Base.astro    <head>, SEO, nav, footer, script
    ├── components/
    │   ├── Navigation.astro
    │   ├── Hero.astro
    │   ├── About.astro
    │   ├── SelectedWork.astro
    │   ├── ProjectCard.astro
    │   ├── AcrossBorders.astro
    │   ├── CaseStudy.astro
    │   ├── Metric.astro / MetricRow.astro
    │   ├── Pillars.astro
    │   ├── Contact.astro
    │   ├── Footer.astro
    │   ├── SectionHeader.astro
    │   └── Media.astro       optional photo (rendered only when set)
    ├── pages/
    │   ├── index.astro
    │   └── work/[slug].astro case studies (generated from site.ts)
    ├── scripts/main.ts       reveal, count-up, nav, menu, copy email
    └── styles/global.css     design tokens, type scale, utilities
```

## Editing content

- `*text*` inside a string renders as the accent italic serif.
- `[[text]]` marks a **placeholder**: it renders highlighted in the rose accent so it can't ship unnoticed. Search for `[[` to find every one.
- **Photos (optional):** the site is typographic by default. Put a file in `public/images/…` and add `cover` / `gallery` to a project (or `portrait` to `hero` / `about`) in `site.ts`, and it renders automatically. See `docs/CONCEPT.md` §11 for what each photo should show.
- Adding a project: add an entry to `projects` in `site.ts` and its case-study page is generated automatically.

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`.
To turn it on, go to **Settings → Pages → Source: GitHub Actions**. For a custom domain, set `SITE_URL` to the domain and `BASE_PATH` to `/` in the workflow.
Vercel and Netlify also work with zero config (build `npm run build`, output `dist`).
