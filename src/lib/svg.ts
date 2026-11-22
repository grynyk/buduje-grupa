/** Helpers for inlining SVG files imported with `?raw`. */
import mark from '@/assets/brand/logo-mark.svg?raw';

/** Decorative inline SVG: hidden from screen readers and from keyboard focus. */
export const decorative = (raw: string) => raw.replace('<svg ', '<svg aria-hidden="true" focusable="false" ');

/**
 * BG® mark centred on its LETTERS: the viewBox is cropped to "BG" (measured from the vector:
 * x 2.6–117.0, y 6.0–79.3) and the ® draws outside it (overflow: visible).
 * Centring this SVG in a circle/pin centres the letters optically; the ® hangs top-right.
 */
export const centredMark = decorative(
  mark
    .replace(/viewBox="[^"]*"/, 'viewBox="2.6 6 114.4 73.3"')
    .replace(/ width="[^"]*" height="[^"]*"/, ' width="114" height="73"')
    .replace('<svg ', '<svg overflow="visible" style="overflow:visible" '),
);
