/**
 * Animation hooks read by src/scripts/animations.ts.
 * A block that opens the page uses the hero intro timeline; anywhere else it reveals on scroll.
 */
export const fadeIn = (hero: boolean) => (hero ? { 'data-hero-fade': '' } : { 'data-reveal': '' });
