import { defineConfig, type TinaField } from 'tinacms';
import { blockTemplates } from './blocks';

const branch =
  process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';

/* ---------- shared field groups ---------- */

const link = (name: string, label: string): TinaField => ({
  type: 'object',
  name,
  label,
  fields: [
    { type: 'string', name: 'label', label: 'Tekst' },
    { type: 'string', name: 'href', label: 'Link' },
  ],
});

const intro = (name: string, label: string): TinaField => ({
  type: 'object',
  name,
  label,
  fields: [
    { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
    { type: 'string', name: 'title', label: 'Tytuł' },
    { type: 'string', name: 'text', label: 'Opis', ui: { component: 'textarea' } },
  ],
});

export const PROJECT_CATEGORIES = [
  'Domy jednorodzinne',
  'Budynki wielorodzinne',
  'Obiekty komercyjne',
  'Remonty i modernizacje',
];

export const SERVICE_ICONS = ['house', 'apartments', 'commercial', 'renovation', 'installations', 'interior'];

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      /* ---------------- Global settings ---------------- */
      {
        name: 'settings',
        label: 'Ustawienia firmy',
        path: 'src/content/settings',
        format: 'json',
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'companyName', label: 'Nazwa firmy', required: true },
          { type: 'string', name: 'legalName', label: 'Pełna nazwa prawna' },
          { type: 'string', name: 'tagline', label: 'Slogan', ui: { component: 'textarea' } },
          { type: 'string', name: 'phone', label: 'Telefon' },
          { type: 'string', name: 'email', label: 'E-mail' },
          { type: 'string', name: 'address', label: 'Adres (ulica)' },
          { type: 'string', name: 'city', label: 'Kod i miasto' },
          { type: 'string', name: 'hours', label: 'Godziny pracy' },
          { type: 'string', name: 'nip', label: 'NIP / KRS / REGON' },
          {
            type: 'string',
            name: 'openingHours',
            label: 'Godziny dla Google (format: Mo-Sa 09:00-18:00)',
          },
          {
            type: 'object',
            name: 'geo',
            label: 'Położenie biura (dla Google)',
            fields: [
              { type: 'number', name: 'lat', label: 'Szerokość (lat)' },
              { type: 'number', name: 'lng', label: 'Długość (lng)' },
            ],
          },
          {
            type: 'object',
            name: 'socials',
            label: 'Social media i mapa',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label }) },
            fields: [
              { type: 'string', name: 'label', label: 'Nazwa' },
              { type: 'string', name: 'url', label: 'URL (# = brak linku)' },
              {
                type: 'string',
                name: 'icon',
                label: 'Ikona',
                options: [
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'youtube', label: 'YouTube' },
                  { value: 'map', label: 'Mapa (Google Maps)' },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'prefooter',
            label: 'Pasek nad stopką (beżowy)',
            description: 'Wyświetlany na wszystkich podstronach. Wariant wybierasz w każdej podstronie.',
            fields: (['quote', 'visit', 'custom'] as const).map(
              (name): TinaField => ({
                type: 'object',
                name,
                label: { quote: 'Cytat', visit: 'Wizyta na budowie', custom: 'Projekt indywidualny' }[name],
                fields: [
                  { type: 'string', name: 'title', label: 'Tytuł', required: true },
                  { type: 'string', name: 'text', label: 'Opis' },
                  link('button', 'Przycisk'),
                ],
              }),
            ),
          },
        ],
      },

      /* ---------------- Home page ---------------- */
      {
        name: 'home',
        label: 'Strona główna',
        path: 'src/content/pages',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/',
        },
        fields: [
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'Meta title' },
              { type: 'string', name: 'description', label: 'Meta description', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'hero',
            label: 'Hero',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
              {
                type: 'string',
                name: 'titleLines',
                label: 'Tytuł (każda linia osobno)',
                list: true,
              },
              { type: 'string', name: 'subtitle', label: 'Podtytuł', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Zdjęcie tła' },
              link('primaryCta', 'Przycisk główny'),
              link('secondaryCta', 'Przycisk drugi'),
              {
                type: 'object',
                name: 'badges',
                label: 'Wyróżniki',
                list: true,
                ui: { itemProps: (item) => ({ label: item?.label }) },
                fields: [
                  { type: 'string', name: 'value', label: 'Wartość' },
                  { type: 'string', name: 'label', label: 'Opis' },
                ],
              },
            ],
          },
          { type: 'string', name: 'marquee', label: 'Pasek przewijany', list: true },
          {
            type: 'object',
            name: 'about',
            label: 'O nas',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
              { type: 'string', name: 'title', label: 'Tytuł', ui: { component: 'textarea' } },
              { type: 'string', name: 'text', label: 'Opis', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Zdjęcie główne' },
              { type: 'image', name: 'imageSecondary', label: 'Zdjęcie dodatkowe' },
              { type: 'string', name: 'highlights', label: 'Wyróżnienia', list: true },
              link('cta', 'Link'),
            ],
          },
          {
            type: 'object',
            name: 'stats',
            label: 'Liczby',
            list: true,
            ui: { itemProps: (item) => ({ label: `${item?.value ?? ''}${item?.suffix ?? ''} ${item?.label ?? ''}` }) },
            fields: [
              { type: 'number', name: 'value', label: 'Wartość' },
              { type: 'number', name: 'decimals', label: 'Miejsca po przecinku (np. 1 → 5,0)' },
              { type: 'string', name: 'suffix', label: 'Sufiks (np. +, %)' },
              { type: 'string', name: 'label', label: 'Opis' },
            ],
          },
          intro('projects', 'Realizacje — nagłówek'),
          {
            type: 'object',
            name: 'process',
            label: 'Proces',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
              { type: 'string', name: 'title', label: 'Tytuł' },
              { type: 'string', name: 'text', label: 'Opis', ui: { component: 'textarea' } },
              {
                type: 'object',
                name: 'steps',
                label: 'Kroki',
                list: true,
                ui: { itemProps: (item) => ({ label: item?.title }) },
                fields: [
                  { type: 'string', name: 'title', label: 'Tytuł' },
                  { type: 'string', name: 'text', label: 'Opis', ui: { component: 'textarea' } },
                  { type: 'string', name: 'meta', label: 'Czas / dodatkowa informacja' },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'testimonials',
            label: 'Opinie',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
              { type: 'string', name: 'title', label: 'Tytuł' },
              {
                type: 'object',
                name: 'rating',
                label: 'Ocena (np. Google)',
                fields: [
                  { type: 'string', name: 'score', label: 'Ocena (np. 5,0)' },
                  { type: 'number', name: 'count', label: 'Liczba opinii' },
                  { type: 'string', name: 'source', label: 'Źródło (np. Google)' },
                  { type: 'string', name: 'url', label: 'Link do opinii' },
                ],
              },
              {
                type: 'object',
                name: 'items',
                label: 'Opinie',
                list: true,
                ui: { itemProps: (item) => ({ label: item?.author }) },
                fields: [
                  { type: 'string', name: 'quote', label: 'Treść', ui: { component: 'textarea' } },
                  { type: 'string', name: 'author', label: 'Autor' },
                  { type: 'string', name: 'role', label: 'Inwestycja / rola' },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'cta',
            label: 'Baner CTA',
            fields: [
              { type: 'string', name: 'title', label: 'Tytuł' },
              { type: 'string', name: 'text', label: 'Opis', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Zdjęcie' },
              link('button', 'Przycisk'),
            ],
          },
          intro('contact', 'Kontakt — nagłówek'),
          {
            type: 'object',
            name: 'instagram',
            label: 'Instagram',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
              { type: 'string', name: 'title', label: 'Tytuł' },
              { type: 'string', name: 'text', label: 'Opis', ui: { component: 'textarea' } },
              {
                type: 'string',
                name: 'posts',
                label: 'Posty (linki, np. https://www.instagram.com/p/…/)',
                list: true,
              },
            ],
          },
        ],
      },

      /* ---------------- Services ---------------- */
      {
        name: 'services',
        label: 'Usługi',
        path: 'src/content/services',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Nazwa', isTitle: true, required: true },
          { type: 'number', name: 'order', label: 'Kolejność' },
          { type: 'string', name: 'icon', label: 'Ikona', options: SERVICE_ICONS },
          { type: 'string', name: 'excerpt', label: 'Krótki opis', ui: { component: 'textarea' } },
          { type: 'image', name: 'image', label: 'Zdjęcie' },
          { type: 'string', name: 'points', label: 'Zakres (punkty)', list: true },
          { type: 'rich-text', name: 'body', label: 'Treść', isBody: true },
        ],
      },

      /* ---------------- Site pages (page builder) ---------------- */
      {
        name: 'site',
        label: 'Podstrony',
        path: 'src/content/site',
        format: 'json',
        ui: {
          router: ({ document }) => `/${document._sys.filename}`,
        },
        fields: [
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'Meta title', required: true },
              { type: 'string', name: 'description', label: 'Meta description', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'string',
            name: 'prefooter',
            label: 'Pasek nad stopką',
            description: 'Treści pasków edytujesz w: Ustawienia firmy → Pasek nad stopką',
            options: [
              { value: 'quote', label: '„Budujemy tak, jakbyśmy budowali dla siebie.”' },
              { value: 'visit', label: 'Chcesz zobaczyć dom na żywo?' },
              { value: 'custom', label: 'Nie znalazłeś swojego domu?' },
              { value: 'none', label: 'Brak' },
            ],
          },
          {
            type: 'object',
            name: 'hero',
            label: 'Nagłówek strony (opcjonalny)',
            fields: [
              {
                type: 'string',
                name: 'layout',
                label: 'Układ',
                options: [
                  { value: 'split', label: 'Tytuł + opis obok (białe tło)' },
                  { value: 'image-side', label: 'Tekst + zdjęcie obok' },
                  { value: 'image-bg', label: 'Zdjęcie w tle' },
                  { value: 'dark', label: 'Zielone tło' },
                ],
              },
              { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
              { type: 'string', name: 'title', label: 'Tytuł' },
              { type: 'string', name: 'text', label: 'Opis', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Zdjęcie' },
              { type: 'string', name: 'imageAlt', label: 'Opis zdjęcia (alt)' },
            ],
          },
          { type: 'object', name: 'blocks', label: 'Sekcje', list: true, templates: blockTemplates },
        ],
      },

      /* ---------------- Catalog ---------------- */
      {
        name: 'catalog',
        label: 'Katalog projektów',
        path: 'src/content/catalog',
        format: 'md',
        ui: {
          router: ({ document }) => `/katalog/${document._sys.filename}`,
        },
        fields: [
          { type: 'string', name: 'title', label: 'Nazwa (np. Las 90)', isTitle: true, required: true },
          { type: 'number', name: 'area', label: 'Powierzchnia (m²)', required: true },
          { type: 'string', name: 'rooms', label: 'Pokoje (np. 3 pokoje)', required: true },
          { type: 'string', name: 'feature', label: 'Wyróżnik (np. antresola)' },
          {
            type: 'string',
            name: 'floors',
            label: 'Kondygnacje',
            options: ['parterowy', 'z poddaszem'],
            required: true,
          },
          { type: 'image', name: 'image', label: 'Zdjęcie', required: true },
          { type: 'string', name: 'excerpt', label: 'Krótki opis', ui: { component: 'textarea' } },
          { type: 'image', name: 'gallery', label: 'Galeria (wizualizacje)', list: true },
          {
            type: 'object',
            name: 'plans',
            label: 'Rzuty',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || 'Rzut' }) },
            fields: [
              { type: 'image', name: 'image', label: 'Rysunek' },
              { type: 'string', name: 'label', label: 'Podpis (np. Parter)' },
            ],
          },
          {
            type: 'string',
            name: 'modifications',
            label: 'Co możemy zmienić (puste = lista domyślna)',
            list: true,
          },
          { type: 'number', name: 'order', label: 'Kolejność' },
          { type: 'rich-text', name: 'body', label: 'Opis', isBody: true },
        ],
      },

      /* ---------------- Projects ---------------- */
      {
        name: 'projects',
        label: 'Realizacje',
        path: 'src/content/projects',
        format: 'md',
        ui: {
          router: ({ document }) => `/realizacje/${document._sys.filename}`,
        },
        fields: [
          { type: 'string', name: 'title', label: 'Nazwa', isTitle: true, required: true },
          { type: 'string', name: 'category', label: 'Kategoria', options: PROJECT_CATEGORIES, required: true },
          { type: 'string', name: 'location', label: 'Lokalizacja' },
          { type: 'number', name: 'year', label: 'Rok' },
          { type: 'string', name: 'area', label: 'Powierzchnia' },
          { type: 'string', name: 'duration', label: 'Czas realizacji' },
          { type: 'string', name: 'scope', label: 'Zakres prac' },
          { type: 'string', name: 'excerpt', label: 'Krótki opis', ui: { component: 'textarea' } },
          { type: 'image', name: 'cover', label: 'Zdjęcie główne', required: true },
          { type: 'image', name: 'gallery', label: 'Galeria', list: true },
          { type: 'boolean', name: 'featured', label: 'Wyróżniona na stronie głównej' },
          { type: 'number', name: 'order', label: 'Kolejność' },
          { type: 'rich-text', name: 'body', label: 'Opis realizacji', isBody: true },
        ],
      },
    ],
  },
});

