import type { Template, TinaField } from 'tinacms';

/** Page-builder block templates — mirror the `blocks` union in src/content.config.ts. */

const link = (name: string, label: string): TinaField => ({
  type: 'object',
  name,
  label,
  fields: [
    { type: 'string', name: 'label', label: 'Tekst' },
    { type: 'string', name: 'href', label: 'Link' },
  ],
});

const theme: TinaField = {
  type: 'string',
  name: 'theme',
  label: 'Tło',
  options: [
    { value: 'light', label: 'Białe' },
    { value: 'paper', label: 'Beżowe' },
    { value: 'sage', label: 'Szałwia (jasna zieleń)' },
    { value: 'dark', label: 'Zielone' },
  ],
};

const textarea = (name: string, label: string): TinaField => ({ type: 'string', name, label, ui: { component: 'textarea' } });

const titledList = (name = 'items', label = 'Elementy'): TinaField => ({
  type: 'object',
  name,
  label,
  list: true,
  ui: { itemProps: (item) => ({ label: item?.title }) },
  fields: [{ type: 'string', name: 'title', label: 'Tytuł' }, textarea('text', 'Opis')],
});

export const blockTemplates: Template[] = [
  {
    name: 'features',
    label: 'Lista cech (kolumny)',
    fields: [
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      { type: 'string', name: 'title', label: 'Tytuł' },
      textarea('text', 'Opis'),
      { type: 'boolean', name: 'numbered', label: 'Numeruj (01, 02…)' },
      { type: 'number', name: 'columns', label: 'Liczba kolumn (2–4)' },
      theme,
      {
        type: 'string',
        name: 'layout',
        label: 'Układ',
        options: [
          { value: 'grid', label: 'Kolumny pod nagłówkiem' },
          { value: 'split', label: 'Nagłówek z lewej, kafle 2×2 z prawej' },
        ],
      },
      link('link', 'Link pod opisem'),
      {
        type: 'object',
        name: 'items',
        label: 'Elementy',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.title }) },
        fields: [
          { type: 'string', name: 'title', label: 'Tytuł' },
          textarea('text', 'Opis'),
          {
            type: 'string',
            name: 'icon',
            label: 'Ikona',
            options: ['calendar', 'thermometer', 'clock', 'leaf', 'house', 'check', 'installations', 'renovation'],
          },
        ],
      },
    ],
  },
  {
    name: 'people',
    label: 'Zespół / założyciele',
    fields: [
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      { type: 'string', name: 'title', label: 'Tytuł' },
      textarea('text', 'Opis'),
      textarea('quote', 'Cytat podpisany przez osoby'),
      { type: 'string', name: 'signature', label: 'Podpis cytatu (puste = imiona osób)' },
      {
        type: 'object',
        name: 'items',
        label: 'Osoby',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.name }) },
        fields: [
          { type: 'string', name: 'name', label: 'Imię i nazwisko' },
          { type: 'string', name: 'role', label: 'Rola' },
          { type: 'image', name: 'photo', label: 'Zdjęcie (pionowe 4:5)' },
          { type: 'string', name: 'initials', label: 'Inicjały (gdy brak zdjęcia)' },
          textarea('bio', 'Krótko o osobie'),
        ],
      },
    ],
  },
  {
    name: 'quote',
    label: 'Cytat (zielony)',
    fields: [textarea('text', 'Cytat'), link('button', 'Przycisk')],
  },
  {
    name: 'mediaText',
    label: 'Zdjęcie + tekst',
    fields: [
      { type: 'image', name: 'image', label: 'Zdjęcie' },
      { type: 'string', name: 'imageAlt', label: 'Opis zdjęcia (alt)' },
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      { type: 'string', name: 'title', label: 'Tytuł' },
      textarea('text', 'Opis'),
      titledList('items', 'Lista'),
      textarea('note', 'Wyróżniona notka'),
      link('button', 'Przycisk'),
      { type: 'boolean', name: 'reverse', label: 'Zdjęcie po prawej' },
      theme,
    ],
  },
  {
    name: 'packages',
    label: 'Pakiety / standardy',
    fields: [
      {
        type: 'object',
        name: 'items',
        label: 'Pakiety',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.name }) },
        fields: [
          { type: 'string', name: 'name', label: 'Nazwa' },
          { type: 'string', name: 'lead', label: 'Opis' },
          { type: 'string', name: 'price', label: 'Cena' },
          { type: 'string', name: 'features', label: 'Zakres', list: true },
          { type: 'boolean', name: 'highlighted', label: 'Wyróżniony (zielony)' },
          { type: 'string', name: 'badge', label: 'Etykieta' },
        ],
      },
      link('button', 'Przycisk w kartach'),
      { type: 'string', name: 'includedTitle', label: 'Nagłówek „w każdym pakiecie”' },
      { type: 'string', name: 'included', label: 'W każdym pakiecie', list: true },
    ],
  },
  {
    name: 'steps',
    label: 'Kroki (proces)',
    fields: [{ type: 'string', name: 'eyebrow', label: 'Nadtytuł' }, titledList('items', 'Kroki')],
  },
  {
    name: 'guide',
    label: 'Poradnik — formularz (wysyłka na e-mail)',
    fields: [
      {
        type: 'string',
        name: 'variant',
        label: 'Wariant',
        options: [
          { value: 'hero', label: 'Otwiera stronę (H1)' },
          { value: 'closing', label: 'Zielony pas na końcu strony' },
        ],
      },
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      { type: 'string', name: 'title', label: 'Tytuł' },
      textarea('text', 'Opis'),
      { type: 'string', name: 'topics', label: 'Tematy (lista)', list: true },
      { type: 'image', name: 'image', label: 'Okładka poradnika (opcjonalnie)' },
      { type: 'string', name: 'formTitle', label: 'Tytuł formularza' },
      { type: 'string', name: 'buttonLabel', label: 'Tekst przycisku' },
      { type: 'string', name: 'note', label: 'Notka pod przyciskiem' },
      { type: 'string', name: 'pdf', label: 'Link do PDF (pokazany po wysłaniu — opcjonalnie)' },
      { type: 'boolean', name: 'showRating', label: 'Pokaż ocenę Google' },
    ],
  },
  {
    name: 'commitment',
    label: 'Zdjęcie + zobowiązania',
    fields: [
      { type: 'image', name: 'image', label: 'Zdjęcie' },
      { type: 'string', name: 'imageAlt', label: 'Opis zdjęcia (alt)' },
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      { type: 'string', name: 'title', label: 'Tytuł' },
      titledList('items', 'Zobowiązania'),
      textarea('quote', 'Cytat zamykający (opcjonalnie — zwykle wystarczy pasek nad stopką)'),
      link('button', 'Przycisk'),
      theme,
    ],
  },
  {
    name: 'timeline',
    label: 'Proces szczegółowy (oś + etapy)',
    fields: [
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł nad spisem etapów' },
      { type: 'string', name: 'weLabel', label: 'Nagłówek kolumny „po naszej stronie”' },
      { type: 'string', name: 'youLabel', label: 'Nagłówek kolumny „po Twojej stronie”' },
      { type: 'string', name: 'resultLabel', label: 'Nagłówek kolumny „efekt”' },
      {
        type: 'object',
        name: 'items',
        label: 'Etapy',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.title }) },
        fields: [
          { type: 'string', name: 'title', label: 'Nazwa etapu' },
          { type: 'string', name: 'duration', label: 'Czas trwania (np. 2–3 tyg.)' },
          textarea('text', 'Opis'),
          { type: 'string', name: 'we', label: 'Po naszej stronie', list: true },
          { type: 'string', name: 'you', label: 'Po Twojej stronie', list: true },
          textarea('result', 'Efekt etapu'),
        ],
      },
    ],
  },
  {
    name: 'stats',
    label: 'Duże liczby',
    fields: [
      theme,
      {
        type: 'object',
        name: 'items',
        label: 'Liczby',
        list: true,
        ui: { itemProps: (item) => ({ label: `${item?.value ?? ''} ${item?.unit ?? ''}` }) },
        fields: [
          { type: 'string', name: 'value', label: 'Wartość' },
          { type: 'string', name: 'unit', label: 'Jednostka' },
          { type: 'string', name: 'label', label: 'Opis' },
        ],
      },
    ],
  },
  {
    name: 'layers',
    label: 'Przekrój ściany (warstwy)',
    fields: [
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      {
        type: 'object',
        name: 'items',
        label: 'Warstwy (od wnętrza)',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.name }) },
        fields: [
          { type: 'string', name: 'name', label: 'Nazwa' },
          { type: 'string', name: 'text', label: 'Opis' },
          { type: 'string', name: 'color', label: 'Kolor (hex)', ui: { component: 'color' } },
          { type: 'number', name: 'width', label: 'Grubość (proporcja)' },
        ],
      },
    ],
  },
  {
    name: 'faq',
    label: 'FAQ (pytania)',
    fields: [
      {
        type: 'string',
        name: 'heading',
        label: 'Nagłówek',
        options: [
          { value: 'h1', label: 'H1 — sekcja otwiera stronę' },
          { value: 'h2', label: 'H2 — inna sekcja jest wyżej' },
        ],
      },
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      { type: 'string', name: 'title', label: 'Tytuł strony' },
      {
        type: 'object',
        name: 'items',
        label: 'Pytania',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.question }) },
        fields: [{ type: 'string', name: 'question', label: 'Pytanie' }, textarea('answer', 'Odpowiedź')],
      },
      {
        type: 'object',
        name: 'aside',
        label: 'Karta boczna',
        fields: [
          { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
          { type: 'string', name: 'title', label: 'Tytuł' },
          textarea('text', 'Opis'),
          link('button', 'Przycisk'),
        ],
      },
      { type: 'image', name: 'image', label: 'Zdjęcie boczne' },
    ],
  },
  {
    name: 'articles',
    label: 'Artykuły (karty)',
    fields: [
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      theme,
      {
        type: 'object',
        name: 'items',
        label: 'Artykuły',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.title }) },
        fields: [
          { type: 'string', name: 'title', label: 'Tytuł' },
          { type: 'string', name: 'text', label: 'Opis' },
          { type: 'string', name: 'href', label: 'Link' },
        ],
      },
    ],
  },
  {
    name: 'schedule',
    label: 'Harmonogram płatności',
    fields: [
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      {
        type: 'object',
        name: 'stages',
        label: 'Etapy',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.label }) },
        fields: [
          { type: 'string', name: 'label', label: 'Etap' },
          { type: 'string', name: 'value', label: 'Wartość (np. 20%)' },
          { type: 'number', name: 'weight', label: 'Szerokość paska (proporcja)' },
        ],
      },
    ],
  },
  {
    name: 'estimate',
    label: 'Formularz kosztorysu',
    fields: [
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      { type: 'string', name: 'title', label: 'Tytuł' },
      textarea('text', 'Opis'),
      { type: 'string', name: 'standards', label: 'Standardy do wyboru', list: true },
      { type: 'string', name: 'buttonLabel', label: 'Tekst przycisku' },
    ],
  },
  {
    name: 'cta',
    label: 'Pasek CTA',
    fields: [{ type: 'string', name: 'title', label: 'Tytuł' }, textarea('text', 'Opis'), link('button', 'Przycisk'), theme],
  },
  {
    name: 'catalog',
    label: 'Katalog projektów (lista)',
    fields: [{ type: 'string', name: 'note', label: 'Notatka (niewyświetlana)', ui: { component: 'hidden' } }],
  },
  {
    name: 'contact',
    label: 'Kontakt (dane + formularz)',
    fields: [
      { type: 'string', name: 'eyebrow', label: 'Nadtytuł' },
      { type: 'string', name: 'title', label: 'Tytuł strony' },
      textarea('text', 'Opis'),
      { type: 'string', name: 'formTitle', label: 'Tytuł formularza' },
      { type: 'string', name: 'choicesLabel', label: 'Etykieta pola tematu (np. Temat)' },
      { type: 'string', name: 'choices', label: 'Podpowiedzi tematów (można wpisać własny)', list: true },
      { type: 'string', name: 'note', label: 'Notka pod przyciskiem' },
    ],
  },
  {
    name: 'map',
    label: 'Mapa (pasek z adresem)',
    fields: [{ type: 'string', name: 'label', label: 'Tekst (domyślnie adres biura)' }],
  },
];
