# Buduje Grupa — website

Marketing site for a construction company (general contractor), built with **Astro 7 + SCSS + Sveltia CMS + GSAP**.
Fully static (Cloudflare Workers static assets). Content is in Polish and almost all of it is editable in the CMS.

## Quick start

```bash
corepack enable          # once per machine (Yarn 4 via packageManager field)
yarn install
yarn dev                 # Astro on http://localhost:4321
```

- Site: http://localhost:4321
- CMS: http://localhost:4321/admin/index.html → *Pracuj z lokalnym repozytorium* → pick the project folder
  (Chrome/Edge; edits write straight to `src/content/**`, no login, nothing is committed)

| Script           | What it does                                                                     |
| ---------------- | -------------------------------------------------------------------------------- |
| `yarn dev`       | `astro dev` (the CMS is a static page in `public/admin/`, nothing extra to run)  |
| `yarn build`     | Static build to `dist/` (incl. `/admin/`, `/sitemap.xml`, `/robots.txt`)         |
| `yarn preview`   | Serve `dist/`                                                                    |
| `yarn check`     | Type-check `.astro` / `.ts` files + CMS ↔ schema check                           |
| `yarn check:cms` | Only the CMS ↔ schema check (`scripts/check-cms.mjs`)                            |

Yarn Berry with `nodeLinker: node-modules` (see `.yarnrc.yml`).

## How content works

Everything a visitor sees comes from `src/content/`, edited in the CMS:

| CMS                        | File(s)                                | URL                                   |
| -------------------------- | -------------------------------------- | ------------------------------------- |
| **Strony**                 | `src/content/pages/<slug>.json`        | `o-nas` → `/o-nas`                    |
| **Strony stałe**           | `src/content/fixed-pages/{index,404}.json` | `/` and the not-found page — same page builder, but the CMS can't delete them |
| **Realizacje**             | `src/content/projects/<slug>.md`       | `/realizacje/<slug>`                  |
| **Katalog projektów**      | `src/content/catalog/<slug>.md`        | `/katalog/<slug>`                     |
| Ustawienia → Firma, SEO…   | `src/content/settings/global.json`     | company details, socials, map position, SEO defaults, rating fallback |
| Ustawienia → Menu i stopka | `src/content/settings/layout.json`     | menu (header/footer), CTA button, bands above the footer |
| Ustawienia → Strony szczegółów | `src/content/settings/templates.json` | texts on realization / catalog pages |

**Every page is a page builder** — SEO + a list of sections ("blocks") that editors add, remove and reorder,
including the home page. Openers: full-screen hero, page header (4 layouts). Sections: about + numbers, marquee,
featured projects, all projects (filters), process, Instagram, photo banner, testimonials, contact, features, people,
quote, media + text, packages, steps, commitment, timeline, big numbers, wall layers, guide form, FAQ, articles,
payment schedule, estimate form, CTA band, catalog grid, map.

- **Anchors** — any section can get an *anchor* (`kontakt`) so buttons can link to `#kontakt`.
- **New page** — CMS → *Strony* → *Nowa*; it is served at `/<file name>` automatically.
  Add it to the menu in *Ustawienia → Menu i stopka*.
- **Realization** — CMS → *Realizacje* → *Nowa*. *Wyróżniona* puts it in the *Wybrane realizacje* row,
  *Kolejność* sets the order (also used for previous/next links).
- **Catalog design** — CMS → *Katalog projektów* → *Nowy*: area, rooms, floors, images, floor plans
  (shown uncropped), *Co możemy zmienić* (empty = default list from *Strony szczegółów*).

"Zapytaj o…" buttons pre-fill the contact form topic (`?realizacja=` / `?projekt=`).

## SEO

- Per page: *SEO* → title, description, share image, *noindex*. Realizations and catalog designs get a generated
  title (`<name> — Realizacje` through *Szablon tytułu*), their excerpt and photo; an optional *SEO* group overrides them.
- `<head>` (`src/layouts/BaseLayout.astro`): canonical URL, Open Graph / Twitter card, `robots` for noindex pages,
  optional Google Search Console verification (*Ustawienia → Firma → SEO*).
- Structured data (`src/lib/seo.ts`): `HomeAndConstructionBusiness` on every page, `WebSite` on home,
  `BreadcrumbList` on sub-pages and detail pages, `FAQPage` from every FAQ section.
- `/sitemap.xml` (all indexable pages, realizations, designs) and `/robots.txt` are generated at build time
  (`src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`). Submit the sitemap in Google Search Console.
- Clean URLs without a trailing slash (`/o-nas`): `build.format: 'file'` + `trailingSlash: 'never'` in `astro.config.mjs`.
- Images: fill in *Opis zdjęcia (alt)* fields — they are read by screen readers and Google.
- Photos are resized and converted to WebP at build time (`srcset`, so phones get small files). The CMS uploads to
  `src/assets/images/` and writes `/images/<file>` into the content; `src/lib/images.ts` maps that path to the file and
  `<Img>` (`src/components/ui/Img.astro`) renders it. A path that isn't `/images/…` (external URL) is used as is;
  a missing `/images/…` file fails the build. Share images become 1200 px JPEGs.

## Structure

```
public/admin/               Sveltia CMS (index.html loads it from unpkg, pinned to 0.x) + config.yml (CMS fields)
scripts/check-cms.mjs       compares public/admin/config.yml with the content schemas
src/
  content.config.ts         content collections (pages, projects, catalog, settings, layout, templates)
  schemas/                  Zod schemas: common.ts (link, seo, theme…), blocks.ts (page builder), settings.ts
  content/                  the content itself (JSON / Markdown, edited in the CMS)
  pages/                    [...slug].astro (every page), 404, realizacje/[slug], katalog/[slug], sitemap, robots
  layouts/                  BaseLayout (head, header, footer), BlockPage (page builder), DetailLayout (detail pages)
  components/
    blocks/                 one component per block + BlockRenderer
    layout/                 Header, Footer, PreFooter
    forms/                  Web3Form (shared shell), Field, ContactForm, EstimateForm, GuideForm
    cards/                  ProjectCard, DesignCard
    detail/                 Facts, ZoomImage, Gallery, AskBox, Lightbox
    ui/                     Img, Icon, Logo, Title, SocialLinks, GoogleRating
  lib/                      content.ts (getters, URLs), images.ts (photo pipeline), seo.ts, google.ts, contact.ts, format.ts, icons.ts, svg.ts, motion.ts
  scripts/                  animations.ts (GSAP), web3forms.ts (forms), filter.ts (pill filters), map.ts (MapLibre)
  styles/                   global.scss (tokens, base, buttons, utilities), _forms.scss, _abstracts.scss (mixins, auto-injected)
  assets/                   brand logo + social icons (SVG, inlined); images/ = photos (CMS media folder, optimized)
```

### Adding a block

1. Schema in `src/schemas/blocks.ts` (+ add it to the `blocks` union).
2. Component in `src/components/blocks/` (props: `BlockOf<'name'>`) and register it in `BlockRenderer.astro`.
3. CMS fields in `public/admin/config.yml` → `pages` → `blocks` → `types`.
4. `yarn check` — fails if the CMS and the schema disagree.

CMS fields are required by default — mark optional ones `required: false` (empty optional fields are left out
of the files, so Zod's `.optional()` / `.default()` apply).

## Brand

Logo, colours, photos and UI styles come from the BUDUJE GRUPA brand files; page layout and sections are this site's own.

- Headings: **Inter Light**, sentence case (`@include display`)
- Text: **Inter**; labels/nav/buttons: tiny tracked uppercase (`@include label`, `.label`)
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

Plus: hero intro timeline, velocity-reactive marquee, process progress rail, footer wordmark.
`prefers-reduced-motion` disables everything; a 2.5s failsafe un-hides content if JS fails.

## Contact form (Web3Forms)

Every form (`src/components/forms/`: contact, cost estimate, guide) is built on `Web3Form.astro` + `Field.astro` and posts to `https://api.web3forms.com/submit` using `PUBLIC_WEB3FORMS_KEY` from `.env` (Web3Forms keys are public by design). Includes client-side validation, inline success/error states (no `alert()`), a `botcheck` honeypot, and a no-JS fallback (plain form POST).

## Google rating & reviews (Places API)

`src/lib/google.ts` fetches the listing's **rating, review count and up to 5 reviews** from
[Places API (New)](https://developers.google.com/maps/documentation/places/web-service/op-overview) **at build time**
(one request per build; the key never reaches the browser). On the home page the live data replaces:

- the score + count in the *Opinie klientów* section (stars fill to the real score),
- that section's carousel (author linked to their Google profile, stars, date, "Opinie pochodzą z Google Maps"),
- any hero badge / *O firmie* number whose label mentions "Google" (e.g. "5,0 ★ ocena w Google").

If the key is missing or Google is unreachable, the build continues with the fallback from the CMS
(Ustawienia → Firma, SEO i ocena Google → Ocena Google; quotes come from the *Opinie klientów* section).

**Setup**

1. Google Cloud Console → create a project → enable **Places API (New)** → attach a billing account
   (required by Google even for tiny usage; one request per day is negligible).
2. Create an API key, restrict it to *Places API (New)*.
3. Put it in `.env` (and in the host's environment variables): `GOOGLE_PLACES_API_KEY=…`
4. Run `yarn build` once — it looks the listing up by name and prints
   `GOOGLE_PLACE_ID=…`. Add that line to `.env` / the host too.
5. Keep it fresh: `.github/workflows/daily-rebuild.yml` triggers a rebuild every morning — create a deploy hook
   in your host and save it as the GitHub secret `DEPLOY_HOOK_URL`.

The `GoogleRating` badge (Poradnik) uses the same data: live rating when the key is set, otherwise the CMS fallback.

## Free guide (Poradnik inwestora)

`/poradnik-inwestora` is a lead page: two forms (name + e-mail + consent) post to Web3Forms with the subject
*Poradnik inwestora — prośba o PDF*, so every request lands in the company inbox. To deliver the PDF:

1. Put the PDF in `public/poradnik/` (or upload it in the CMS: *Poradnik — formularz → Plik PDF*), e.g. `/poradnik/poradnik-inwestora.pdf`.
2. **Automatic e-mail:** enable the *Autoresponder* in the Web3Forms dashboard (paid plan) with the PDF link in the
   message — the visitor gets it immediately. **Free alternative:** reply to each request from the inbox.
3. Optional: set *Plik PDF* in the guide block — a "Pobierz poradnik teraz" link then appears right after sending.

## Map (Kontakt, O nas)

The `map` block (`src/components/blocks/MapBand.astro`) shows an interactive OpenStreetMap map — **MapLibre GL**
with **OpenFreeMap** vector tiles (free, no API key, no cookies), clean "Positron" style (change `STYLE` in `src/scripts/map.ts`). Licence: keep the "© OpenStreetMap contributors" credit visible.
Position comes from *Ustawienia → Firma → Położenie biura* (lat/lng). The library (~1 MB, gzip ~300 KB) is loaded only when
the map scrolls into view; page scroll is never captured (Ctrl/⌘ + scroll or two fingers to move the map).
Add it to any page as the *Mapa* section in the CMS.

## CMS sign-in (Sveltia)

[Sveltia CMS](https://sveltiacms.app/en/docs) is a free, Git-based editor at **`/admin/`** on the live site. Every save is a
commit to `main` on GitHub → Cloudflare rebuilds → the change is live in ~1–2 min. No CMS service, keys or build step.

Editors need a **GitHub account with write access** to `grynyk/buduje-grupa`
(GitHub → repo → *Settings → Collaborators → Add people*). Two ways to sign in:

- **Access token** (works right away, best for developers): *Zaloguj się za pomocą tokenu dostępu* → the dialog links
  to GitHub with the right permissions pre-selected → paste the token.
- **"Zaloguj się przez GitHub" button** (for the client): one-time setup of the free
  [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) on Cloudflare:
  1. Deploy it with the *Deploy to Cloudflare* button → note the URL `https://sveltia-cms-auth.<subdomain>.workers.dev`.
  2. Register a GitHub App (link in that README), redirect URI `<worker URL>/callback`; copy the Client ID, create a
     client secret; *Install App* → only `grynyk/buduje-grupa`.
  3. Worker → *Settings → Variables and secrets*: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (secret),
     `ALLOWED_DOMAINS` = the site's hostname(s), e.g. `buduje-grupa.storyvoteapp.workers.dev, buduje-grupa.eu, www.buduje-grupa.eu`.
  4. Uncomment `base_url` in `public/admin/config.yml` with the Worker URL, commit.

**Pull before working locally** — CMS saves are commits on `main`.

## Placeholder content

Projects (Realizacje), catalog designs, prices (`[od ___ zł / m²]`), guarantee years (`[X] lat`) and payment
percentages (`[%]`) are placeholders. The 5 photos in `src/assets/images` come from the brand files — add real project
photos via the CMS.
