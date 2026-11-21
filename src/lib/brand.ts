/**
 * BG® mark centred on its LETTERS: the viewBox is cropped to "BG" (measured from the vector:
 * x 2.6–117.0, y 6.0–79.3) and the ® draws outside it (overflow: visible).
 * Centring this SVG in a circle/pin centres the letters optically; the ® hangs top-right.
 */
import mark from '@/assets/brand/logo-mark.svg?raw';

export const LETTERS_VIEWBOX = '2.6 6 114.4 73.3';

export const centredMark = mark
  .replace(/viewBox="[^"]*"/, `viewBox="${LETTERS_VIEWBOX}"`)
  .replace(/ width="[^"]*" height="[^"]*"/, ' width="114" height="73"')
  .replace('<svg ', '<svg overflow="visible" style="overflow:visible" aria-hidden="true" focusable="false" ');
