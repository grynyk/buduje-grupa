/** Stroke icon set (24×24, currentColor) rendered by components/ui/Icon.astro. */
export const ICONS = {
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H4m6-6-6 6 6 6"/>',
  'arrow-down': '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="1"/><path d="M3.5 9.5h17M8 3v4M16 3v4M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2"/>',
  thermometer: '<path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0Z"/><path d="M12 9v7.5"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19 13 11"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  quote:
    '<path d="M9.5 6C6 7.3 4 10 4 13.5V18h6v-6H7c0-2.2 1.2-3.8 3.3-4.6zm10 0C16 7.3 14 10 14 13.5V18h6v-6h-3c0-2.2 1.2-3.8 3.3-4.6z" fill="currentColor" stroke="none"/>',
  house: '<path d="M3 11 12 4l9 7"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/>',
  apartments: '<path d="M4 21V6l7-3v18M11 8h9v13"/><path d="M7 8h1M7 12h1M7 16h1M14 12h1M17 12h1M14 16h1M17 16h1M2 21h20"/>',
  commercial: '<path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6M9 11h6"/>',
  renovation: '<path d="m14 6 4 4M3 21l3-1 11.5-11.5a2.1 2.1 0 0 0-3-3L3 17z"/><path d="M14 21h7"/>',
  installations: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  interior:
    '<path d="M4 18v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5M2 18h20M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M6 18v2M18 18v2"/>',
} as const;

export type IconName = keyof typeof ICONS;

/** Icons an editor can pick for feature items (CMS select: public/admin/config.yml → `&icon_options`). */
export const FEATURE_ICONS = [
  'calendar',
  'thermometer',
  'clock',
  'leaf',
  'house',
  'check',
  'installations',
  'renovation',
  'apartments',
  'commercial',
  'interior',
  'phone',
  'mail',
  'pin',
] as const satisfies readonly IconName[];
