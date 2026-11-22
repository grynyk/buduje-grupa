/**
 * Page-builder sections. Every page in src/content/pages/*.json is `seo` + a list of these blocks.
 *
 * Adding a block:
 *  1. schema here (+ add it to `blocks` below)
 *  2. component in src/components/blocks/ (+ register it in BlockRenderer.astro)
 *  3. CMS fields in public/admin/config.yml → collections › pages › blocks › types
 */
import { z } from 'astro/zod';
import { FEATURE_ICONS } from '@/lib/icons';
import { link, theme, titled } from './common';

/** Every block may carry an anchor: `kontakt` → the section is reachable at `#kontakt`. */
const block = <T extends string, S extends z.ZodRawShape>(name: T, shape: S) =>
  z.object({ _template: z.literal(name), anchor: z.string().optional(), ...shape });

const intro = {
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
};

/** h1 = the block opens the page (hero animation, room for the header) · h2 = a regular section */
const heading = z.enum(['h1', 'h2']);

/* ───────────────────────── Page openers ───────────────────────── */

const hero = block('hero', {
  eyebrow: z.string().optional(),
  titleLines: z.array(z.string()),
  subtitle: z.string().optional(),
  image: z.string(),
  primaryCta: link,
  secondaryCta: link.optional(),
  /** a badge whose label mentions "Google" shows the live Google rating */
  badges: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  showSocials: z.boolean().default(true),
});

const pageHero = block('pageHero', {
  layout: z.enum(['split', 'image-side', 'image-bg', 'dark']).default('split'),
  eyebrow: z.string().optional(),
  title: z.string(),
  text: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  button: link.optional(),
});

/* ───────────────────────── Home-page style sections ───────────────────────── */

const marquee = block('marquee', {
  items: z.array(z.string()).default([]),
});

const about = block('about', {
  eyebrow: z.string().optional(),
  title: z.string(),
  text: z.string().optional(),
  image: z.string(),
  imageAlt: z.string().optional(),
  imageSecondary: z.string().optional(),
  imageSecondaryAlt: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  cta: link.optional(),
  /** text running around the round BG® seal */
  stamp: z.string().optional(),
  /** count-up numbers; a label mentioning "Google" shows the live rating */
  stats: z
    .array(
      z.object({
        value: z.number(),
        decimals: z.number().default(0), // 1 → "5,0"
        suffix: z.string().optional(),
        label: z.string(),
      }),
    )
    .default([]),
});

const featuredProjects = block('featuredProjects', {
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  buttonLabel: z.string().default('Wszystkie realizacje'),
  limit: z.number().default(3),
  theme: theme.default('paper'),
});

const projectList = block('projectList', {
  allLabel: z.string().default('Wszystkie'),
});

const process = block('process', {
  ...intro,
  steps: z.array(z.object({ title: z.string(), text: z.string(), meta: z.string().optional() })).default([]),
});

const instagram = block('instagram', {
  ...intro,
  /** post URLs, e.g. https://www.instagram.com/p/…/ (first 3 are shown) */
  posts: z.array(z.string()).default([]),
});

const banner = block('banner', {
  title: z.string(),
  text: z.string().optional(),
  image: z.string(),
  button: link,
});

const testimonials = block('testimonials', {
  eyebrow: z.string().optional(),
  title: z.string(),
  /** client quotes; replaced by live Google reviews when the Places API key is set */
  items: z.array(z.object({ quote: z.string(), author: z.string(), role: z.string().optional() })).default([]),
  showRating: z.boolean().default(true),
});

const contact = block('contact', {
  heading: heading.default('h2'),
  ...intro,
  formTitle: z.string().optional(),
  choicesLabel: z.string().optional(),
  choices: z.array(z.string()).default([]),
  note: z.string().optional(),
});

/* ───────────────────────── Content sections ───────────────────────── */

const features = block('features', {
  ...intro,
  numbered: z.boolean().default(false),
  columns: z.number().default(3),
  theme: theme.default('light'),
  /** grid: columns under the heading · split: heading left (sticky), 2×2 cells right */
  layout: z.enum(['grid', 'split']).default('grid'),
  link: link.optional(),
  items: z.array(titled.extend({ icon: z.enum(FEATURE_ICONS).optional() })).default([]),
});

const people = block('people', {
  ...intro,
  /** team statement, shown as a signed quote under the cards */
  quote: z.string().optional(),
  /** quote signature; empty = the people's names */
  signature: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        initials: z.string().optional(),
        photo: z.string().optional(),
        bio: z.string().optional(),
      }),
    )
    .default([]),
});

const quote = block('quote', {
  text: z.string(),
  button: link.optional(),
});

const mediaText = block('mediaText', {
  image: z.string(),
  imageAlt: z.string().optional(),
  ...intro,
  items: z.array(titled).default([]),
  note: z.string().optional(),
  button: link.optional(),
  reverse: z.boolean().default(false),
  theme: theme.default('light'),
});

const packages = block('packages', {
  items: z
    .array(
      z.object({
        name: z.string(),
        lead: z.string().optional(),
        price: z.string().optional(),
        features: z.array(z.string()).default([]),
        highlighted: z.boolean().default(false),
        badge: z.string().optional(),
      }),
    )
    .default([]),
  button: link.optional(),
  includedTitle: z.string().optional(),
  included: z.array(z.string()).default([]),
});

const steps = block('steps', {
  eyebrow: z.string().optional(),
  items: z.array(titled).default([]),
});

const commitment = block('commitment', {
  image: z.string(),
  imageAlt: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  items: z.array(titled).default([]),
  quote: z.string().optional(),
  button: link.optional(),
  theme: theme.default('light'),
});

const timeline = block('timeline', {
  eyebrow: z.string().optional(),
  weLabel: z.string().default('Po naszej stronie'),
  youLabel: z.string().default('Po Twojej stronie'),
  resultLabel: z.string().default('Efekt'),
  items: z
    .array(
      z.object({
        title: z.string(),
        duration: z.string().optional(),
        text: z.string().optional(),
        we: z.array(z.string()).default([]),
        you: z.array(z.string()).default([]),
        result: z.string().optional(),
      }),
    )
    .default([]),
});

const stats = block('stats', {
  theme: theme.default('dark'),
  items: z.array(z.object({ value: z.string(), unit: z.string().optional(), label: z.string() })).default([]),
});

const layers = block('layers', {
  eyebrow: z.string().optional(),
  items: z
    .array(z.object({ name: z.string(), text: z.string().optional(), color: z.string(), width: z.number().default(10) }))
    .default([]),
});

const guide = block('guide', {
  /** hero: opens the page (h1, form beside) · closing: green band with the form at the end */
  variant: z.enum(['hero', 'closing']).default('hero'),
  eyebrow: z.string().optional(),
  title: z.string(),
  text: z.string().optional(),
  topics: z.array(z.string()).default([]),
  image: z.string().optional(),
  formTitle: z.string().optional(),
  buttonLabel: z.string().default('Odbieram bezpłatny poradnik'),
  note: z.string().optional(),
  /** optional PDF link shown after sending (as a backup to the e-mail) */
  pdf: z.string().optional(),
  showRating: z.boolean().default(false),
});

const faq = block('faq', {
  heading: heading.default('h1'),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  aside: z
    .object({ eyebrow: z.string().optional(), title: z.string(), text: z.string().optional(), button: link.optional() })
    .optional(),
  image: z.string().optional(),
});

const articles = block('articles', {
  eyebrow: z.string().optional(),
  theme: theme.default('paper'),
  items: z.array(titled.extend({ href: z.string().optional() })).default([]),
});

const schedule = block('schedule', {
  eyebrow: z.string().optional(),
  stages: z.array(z.object({ label: z.string(), value: z.string().optional(), weight: z.number().default(1) })).default([]),
});

const estimate = block('estimate', {
  eyebrow: z.string().optional(),
  title: z.string(),
  text: z.string().optional(),
  standards: z.array(z.string()).default([]),
  buttonLabel: z.string().optional(),
});

const cta = block('cta', {
  title: z.string(),
  text: z.string().optional(),
  button: link,
  theme: theme.default('paper'),
});

const catalog = block('catalog', {});

const map = block('map', {
  label: z.string().optional(),
});

export const blocks = z.discriminatedUnion('_template', [
  hero,
  pageHero,
  marquee,
  about,
  featuredProjects,
  projectList,
  process,
  instagram,
  banner,
  testimonials,
  contact,
  features,
  people,
  quote,
  mediaText,
  packages,
  steps,
  commitment,
  timeline,
  stats,
  layers,
  guide,
  faq,
  articles,
  schedule,
  estimate,
  cta,
  catalog,
  map,
]);

export type Block = z.infer<typeof blocks>;
export type BlockName = Block['_template'];
export type BlockOf<T extends BlockName> = Extract<Block, { _template: T }>;
