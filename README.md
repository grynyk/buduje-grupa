# Buduje Grupa — website demo

Marketing site for a construction company (general contractor), built with **Astro 7 + SCSS + TinaCMS + GSAP**. Content is in Polish.

## Quick start

```bash
corepack enable          # once per machine (Yarn 4 via packageManager field)
yarn install
yarn dev                 # Astro on http://localhost:4321 + TinaCMS
```

- Site: http://localhost:4321
- CMS: http://localhost:4321/admin/index.html (local mode, edits write straight to `src/content/**`)

| Script           | What it does                                                         |
| ---------------- | -------------------------------------------------------------------- |
| `yarn dev`       | TinaCMS local server + `astro dev`                                   |
| `yarn dev:site`  | Astro only (no CMS)                                                  |
| `yarn build`     | Static build to `dist/` (no CMS admin)                               |
| `yarn build:cms` | `tinacms build && astro build` — production build incl. `/admin`, needs TinaCloud env vars |
| `yarn preview`   | Serve `dist/`                                                        |
| `yarn check`     | Type-check `.astro` / `.ts` files                                    |

Yarn Berry with `nodeLinker: node-modules` (see `.yarnrc.yml`).

## Pages

Every main-menu item is its own page (nav order lives in `src/lib/nav.ts`):

| URL | Source | Edit in Tina |
| --- | --- | --- |
| `/` | `src/content/pages/home.json` | Strona główna |
| `/o-nas`, `/oferta`, `/katalog`, `/technologia`, `/proces-budowy`, `/poradnik-inwestora`, `/gwarancja`, `/finansowanie`, `/kontakt` | `src/content/site/<slug>.json` | Podstrony |
| `/realizacje`, `/realizacje/<slug>` | `src/content/projects/*.md` | Realizacje |
| `/katalog/<slug>` | `src/content/catalog/*.md` | Katalog projektów |

**Podstrony** are built from reusable sections ("blocks"): an optional page header (4 layouts) plus any list of
features, people, quote, media + text, packages, steps, big numbers, wall layers, FAQ, articles, payment schedule,
estimate form, CTA band, catalog grid, contact (details + form) and map band. Add a new page by creating
`src/content/site/<slug>.json` in Tina — it is served at `/<slug>` automatically (add it to `src/lib/nav.ts` to show it in the menu).

**Adding a realization** — Tina → *Realizacje* → *Create new*. The file name becomes the URL
(`dom-pod-lasem` → `/realizacje/dom-pod-lasem`). Fill name, category, location, year, area, duration, scope, short
description, main photo, gallery and the story (rich text). *Wyróżniona* puts it in the home page row (first 3),
*Kolejność* sets the order (also used for previous/next links).

**Adding a catalog design** — Tina → *Katalog projektów* → *Create new*: area, rooms, floors, feature, main image,
optional visualisations (*Galeria*), floor plans (*Rzuty*, shown uncropped), *Co możemy zmienić* (empty = default list)
and the description.

Both detail pages share `src/components/detail/*` (facts bar, zoomable images, gallery, sticky ask box) and
`src/components/Lightbox.astro` (full-screen viewer: ←/→, swipe, Esc). "Zapytaj o…" buttons pre-fill the contact form
topic (`?realizacja=` / `?projekt=`).

Placeholders from the brand mockups are kept as-is: prices (`[od ___ zł / m²]`), guarantee years (`[X] lat`),
payment percentages (`[%]`), founders' roles (`[rola]`).

## Structure

```
tina/config.ts              CMS schema (settings, home, site pages, catalog, projects, services)
tina/blocks.ts              page-builder block templates
src/content.config.ts       Astro collections — mirrors the Tina schema
src/content/
  settings/global.json      company name, phone, e-mail, address, socials + map
  pages/home.json           home-page copy
  site/*.json               the 9 sub-pages
  catalog/*.md              ready-made house designs
  projects/*.md             realizations
  services/*.md             6 services (CMS only — not shown on the site right now)
src/assets/brand/           logo-wordmark.svg, logo-mark.svg (vector, currentColor)
src/assets/icons/           brand social icons (Instagram, Facebook, YouTube, map pin)
src/components/             Header, Footer, Logo, PageHero, ProjectCard, ContactForm, EstimateForm, SocialLinks, …
src/components/home/        home-page sections
src/components/blocks/      page-builder blocks + BlockRenderer
src/pages/                  /, /[slug], /realizacje/*, /katalog/[slug], 404
src/styles/                 global.scss (tokens, base, buttons), _forms.scss, _abstracts.scss (mixins, auto-injected)
src/scripts/                animations.ts (GSAP), web3forms.ts (form submit), filter.ts (pill filters)
public/images/              photos (Tina media root)
```

When adding a field in `tina/config.ts` / `tina/blocks.ts`, add it to `src/content.config.ts` too.

## Brand

Logo, colours, photos and UI styles come from the BUDUJE GRUPA brand files; page layout and sections are this site's own.

- Headings: **Jost Light**, sentence case (`@include display`)
- Text: **Archivo**; labels/nav/buttons: tiny tracked uppercase (`@include label`, `.label`)
- Section labels numbered: "01 — O nas"
- Square buttons, hairline dividers, pill filters (`.pill`), white input boxes on paper cards
- Backgrounds: white page, paper (`.theme-paper`) and green (`.theme-dark`) blocks

| Token           | Value     | Role                                                        |
| --------------- | --------- | ----------------------------------------------------------- |
| `--c-white`     | `#ffffff` | page                                                        |
| `--c-paper`     | `#f6f4f0` | beige containers: bands, cards, pre-footer (`.theme-paper`) |
| `--c-sage`      | `#dbe0d9` | testimonials band, map band (`.theme-sage`)                 |
| `--c-green`     | `#063424` | text, primary buttons, dark sections (`.theme-dark`)        |
| `--c-green-2`   | `#0b402d` | button hover, raised surface on green                       |
| `--c-wood`      | `#dbbd8c` | warm accent on green (labels, active states, badge)         |
| `--c-bark`      | `#5c4533` | warm accent on light (section labels, numbers)              |
| `--c-sage-dark` | `#8c9e94` | quiet details                                               |

Muted text and hairlines are the brand green (or white on green) at reduced opacity, so every colour on the site
comes from the palette. Sections use semantic tokens (`--bg`, `--fg`, `--muted`, `--line`, `--accent`, `--action…`),
so a component adapts to whichever theme class wraps it. Neighbouring sections never share a colour.

## Animations (GSAP)

All in `src/scripts/animations.ts`, driven by data attributes:

| Attribute               | Effect                                           |
| ----------------------- | ------------------------------------------------ |
| `data-reveal`           | fade + rise on scroll                            |
| `data-reveal-stagger`   | same, staggered over children                    |
| `data-split`            | heading line-by-line mask reveal (SplitText)     |
| `data-clip-reveal`      | image unmasks from bottom                        |
| `data-parallax="-10"`   | scrubbed parallax (yPercent range)               |
| `data-counter="240"`    | count-up number                                  |

Plus: hero intro timeline, velocity-reactive marquee, pinned horizontal projects scroller (≥1024px), process progress rail, footer wordmark.
`prefers-reduced-motion` disables everything; a 2.5s failsafe un-hides content if JS fails.

## Contact form (Web3Forms)

`src/components/ContactForm.astro` (contact) and `EstimateForm.astro` (cost estimate) post to `https://api.web3forms.com/submit` using `PUBLIC_WEB3FORMS_KEY` from `.env` (Web3Forms keys are public by design). Includes client-side validation, inline success/error states (no `alert()`), a `botcheck` honeypot, and a no-JS fallback (plain form POST).

## Google rating & reviews (Places API)

`src/lib/google.ts` fetches the listing's **rating, review count and up to 5 reviews** from
[Places API (New)](https://developers.google.com/maps/documentation/places/web-service/op-overview) **at build time**
(one request per build; the key never reaches the browser). On the home page the live data replaces:

- the score + count in **Opinie** (stars fill to the real score),
- the review carousel (author linked to their Google profile, stars, date, "Opinie pochodzą z Google Maps"),
- any hero badge / stat whose label mentions "Google" (e.g. "5,0 ★ ocena w Google").

If the key is missing or Google is unreachable, the build continues with the values from the CMS
(Strona główna → Opinie → Ocena; Strona główna → Opinie → Elementy for quotes).

**Setup**

1. Google Cloud Console → create a project → enable **Places API (New)** → attach a billing account
   (required by Google even for tiny usage; one request per day is negligible).
2. Create an API key, restrict it to *Places API (New)*.
3. Put it in `.env` (and in the host's environment variables): `GOOGLE_PLACES_API_KEY=…`
4. Run `yarn build` once — it looks the listing up by name and prints
   `GOOGLE_PLACE_ID=…`. Add that line to `.env` / the host too.
5. Keep it fresh: `.github/workflows/daily-rebuild.yml` triggers a rebuild every morning — create a deploy hook
   in your host and save it as the GitHub secret `DEPLOY_HOOK_URL`.

The `GoogleRating` badge (hero, Poradnik) uses the same data: live rating when the key is set, otherwise
Strona główna → Opinie → Ocena.

## Free guide (Poradnik inwestora)

`/poradnik-inwestora` is a lead page: two forms (name + e-mail + consent) post to Web3Forms with the subject
*Poradnik inwestora — prośba o PDF*, so every request lands in the company inbox. To deliver the PDF:

1. Put the PDF in `public/poradnik/` (or upload it in Tina), e.g. `/poradnik/poradnik-inwestora.pdf`.
2. **Automatic e-mail:** enable the *Autoresponder* in the Web3Forms dashboard (paid plan) with the PDF link in the
   message — the visitor gets it immediately. **Free alternative:** reply to each request from the inbox.
3. Optional: set *Link do PDF* in the guide block — a "Pobierz poradnik teraz" link then appears right after sending.

## Map (Kontakt, O nas)

The `map` block (`src/components/blocks/MapBand.astro`) shows an interactive OpenStreetMap map — **MapLibre GL**
with **OpenFreeMap** vector tiles (free, no API key, no cookies), clean "Positron" style (change `STYLE` in `src/scripts/map.ts`). Licence: keep the "© OpenStreetMap contributors" credit visible.
Position comes from *Ustawienia firmy → Położenie biura* (lat/lng). The library (~1 MB, gzip ~300 KB) is loaded only when
the map scrolls into view; page scroll is never captured (Ctrl/⌘ + scroll or two fingers to move the map).
Add it to any page as the *Mapa* section in Tina.

## Deploying with the CMS

1. Create a project on [TinaCloud](https://app.tina.io) connected to the Git repo.
2. Set `PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` in the host's env.
3. Use `yarn build:cms` as the build command, output dir `dist`.

## Placeholder content

Projects (Realizacje), catalog designs, prices (`[od ___ zł / m²]`), guarantee years (`[X] lat`) and payment
percentages (`[%]`) are placeholders. The 5 photos in `public/images` come from the brand files — add real project
photos via the CMS.
