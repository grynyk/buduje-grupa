/**
 * Google rating + reviews for the company listing, fetched from the Places API (New) at BUILD time.
 *
 * Env (server-only — never exposed to the browser):
 *   GOOGLE_PLACES_API_KEY   API key with "Places API (New)" enabled
 *   GOOGLE_PLACE_ID         the listing's Place ID (if empty, it is looked up once by name and printed)
 *   GOOGLE_PLACE_QUERY      optional search text for that lookup
 *   GOOGLE_PLACES_API_URL   optional API base URL (tests / proxy)
 *
 * Returns null when not configured or when Google is unreachable — callers then fall back to the CMS values,
 * so a build never fails because of this.
 * Data is refreshed on every build; schedule a daily rebuild to keep it current (see README).
 */
import { getSettings } from './content';
import { formatNumber } from './format';

export interface GoogleReview {
  author: string;
  authorUrl?: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  relativeTime?: string;
  publishTime?: string;
}

export interface GooglePlace {
  rating: number;
  count: number;
  url?: string;
  reviews: GoogleReview[];
}

const API = (import.meta.env.GOOGLE_PLACES_API_URL as string | undefined) ?? 'https://places.googleapis.com/v1';
const DEFAULT_QUERY = 'BUDUJE-GRUPA Sp. z o.o. Krzeszowice';
const TIMEOUT_MS = 8000;

const env = (name: string): string | undefined =>
  (import.meta.env[name] as string | undefined) || (typeof process !== 'undefined' ? process.env[name] : undefined) || undefined;

async function call(url: string, init: RequestInit & { fieldMask: string }, key: string) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': init.fieldMask },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${res.status} ${body?.error?.message ?? res.statusText}`);
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function findPlaceId(key: string): Promise<string | undefined> {
  const query = env('GOOGLE_PLACE_QUERY') ?? DEFAULT_QUERY;
  const data = await call(
    `${API}/places:searchText`,
    { method: 'POST', body: JSON.stringify({ textQuery: query, languageCode: 'pl' }), fieldMask: 'places.id,places.displayName,places.formattedAddress' },
    key,
  );
  const place = data.places?.[0];
  if (place?.id) {
    console.info(
      `[google] Found "${place.displayName?.text}" (${place.formattedAddress}).\n` +
        `[google] Save it to skip this lookup:  GOOGLE_PLACE_ID=${place.id}`,
    );
  }
  return place?.id;
}

async function load(): Promise<GooglePlace | null> {
  const key = env('GOOGLE_PLACES_API_KEY');
  if (!key) {
    console.info('[google] GOOGLE_PLACES_API_KEY not set — using the rating from the CMS.');
    return null;
  }
  try {
    const id = env('GOOGLE_PLACE_ID') ?? (await findPlaceId(key));
    if (!id) {
      console.warn('[google] Place not found — set GOOGLE_PLACE_ID. Using the rating from the CMS.');
      return null;
    }
    const p = await call(
      `${API}/places/${encodeURIComponent(id)}?languageCode=pl`,
      { method: 'GET', fieldMask: 'rating,userRatingCount,googleMapsUri,reviews' },
      key,
    );
    if (typeof p.rating !== 'number') return null;

    const reviews: GoogleReview[] = (p.reviews ?? [])
      .map((r: any) => ({
        author: r.authorAttribution?.displayName ?? 'Użytkownik Google',
        authorUrl: r.authorAttribution?.uri,
        authorPhoto: r.authorAttribution?.photoUri,
        rating: r.rating ?? 0,
        text: (r.text?.text ?? r.originalText?.text ?? '').trim(),
        relativeTime: r.relativePublishTimeDescription,
        publishTime: r.publishTime,
      }))
      .filter((r: GoogleReview) => r.text); // star-only ratings have no text to show

    console.info(`[google] Rating ${p.rating} from ${p.userRatingCount} reviews (${reviews.length} with text).`);
    return { rating: p.rating, count: p.userRatingCount ?? 0, url: p.googleMapsUri, reviews };
  } catch (err) {
    console.warn(`[google] Could not load reviews (${(err as Error).message}) — using the rating from the CMS.`);
    return null;
  }
}

let cached: Promise<GooglePlace | null> | undefined;

/** One request per build, shared by every page that needs it. */
export const getGooglePlace = () => (cached ??= load());

/** 5 → "5,0", 4.86 → "4,9" */
export const formatRating = (value: number) => formatNumber(value, 1);

/**
 * Rating to display anywhere on the site: live Google data when configured,
 * otherwise the fallback saved in the CMS (Ustawienia firmy → Ocena Google).
 */
export async function getRating(): Promise<{ score: number; count: number; url?: string } | null> {
  const live = await getGooglePlace();
  if (live) return { score: live.rating, count: live.count, url: live.url };
  return (await getSettings()).rating ?? null;
}
