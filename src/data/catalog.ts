/**
 * KHAMSIN — the house catalogue.
 *
 * One glass form, five traces. Every product renders through the same bottle;
 * what changes is the juice, the light and the words. Colours are authored in
 * linear-ish sRGB triplets so they can go straight into the scene and into CSS.
 */

export type Note = { name: string; note: string }

export type Product = {
  slug: string
  index: string
  name: string
  arabic: string
  tagline: string
  story: string
  /** top → heart → base, in wear order */
  top: Note[]
  heart: Note[]
  base: Note[]
  /** the juice, as seen through the glass */
  juice: string
  /** the light this perfume throws into the room */
  light: string
  concentration: string
  size: string
  price: number
  /** 1–5, drawn as meters on the product page */
  sillage: number
  longevity: number
  year: string
}

export const CURRENCY = 'USD'

export const PRODUCTS: Product[] = [
  {
    slug: 'siwa',
    index: '01',
    name: 'SIWA',
    arabic: 'سيوة',
    tagline: 'Salt air over a fig orchard.',
    story:
      'Composed after a week in the western desert, where the springs run salt and the fig trees hold the only shade for a hundred kilometres. It opens cold and mineral, then warms the way stone warms after the sun has gone.',
    top: [
      { name: 'Salt', note: 'mineral' },
      { name: 'Fig leaf', note: 'green' },
      { name: 'Bergamot', note: 'citrus' },
    ],
    heart: [
      { name: 'Fig milk', note: 'lactonic' },
      { name: 'Orris', note: 'powder' },
    ],
    base: [
      { name: 'White amber', note: 'warm' },
      { name: 'Cedar', note: 'dry' },
      { name: 'Musk', note: 'skin' },
    ],
    juice: '#d9c48a',
    light: '#f2c877',
    concentration: 'Extrait de parfum · 24%',
    size: '50 ml',
    price: 195,
    sillage: 3,
    longevity: 4,
    year: '2024',
  },
  {
    slug: 'layl',
    index: '02',
    name: 'LAYL',
    arabic: 'ليل',
    tagline: 'Oud, saffron, and a door left open.',
    story:
      'The house in full dress. Laotian oud aged four years, saffron laid over it like a stain, and black leather underneath so the whole thing has a floor. Built for cold air and late hours; it will not behave in daylight.',
    top: [
      { name: 'Saffron', note: 'spice' },
      { name: 'Pink pepper', note: 'bite' },
    ],
    heart: [
      { name: 'Laotian oud', note: 'resin' },
      { name: 'Rose absolute', note: 'floral' },
    ],
    base: [
      { name: 'Black leather', note: 'smoke' },
      { name: 'Labdanum', note: 'balsam' },
      { name: 'Vetiver', note: 'earth' },
    ],
    juice: '#5a1f14',
    light: '#ff7a3c',
    concentration: 'Extrait de parfum · 30%',
    size: '50 ml',
    price: 320,
    sillage: 5,
    longevity: 5,
    year: '2023',
  },
  {
    slug: 'narenj',
    index: '03',
    name: 'NARENJ',
    arabic: 'نارنج',
    tagline: 'Bitter orange, cut with smoke.',
    story:
      'Bitter orange from the trees that line every old street in Cairo — the fruit nobody eats and everybody smells. Neroli holds the middle, vetiver takes it down before it turns sweet.',
    top: [
      { name: 'Bitter orange', note: 'peel' },
      { name: 'Petitgrain', note: 'twig' },
    ],
    heart: [
      { name: 'Neroli', note: 'blossom' },
      { name: 'Geranium', note: 'green' },
    ],
    base: [
      { name: 'Vetiver', note: 'root' },
      { name: 'Tonka', note: 'soft' },
    ],
    juice: '#c96a1e',
    light: '#ffab52',
    concentration: 'Extrait de parfum · 22%',
    size: '50 ml',
    price: 185,
    sillage: 3,
    longevity: 3,
    year: '2025',
  },
  {
    slug: 'zahr',
    index: '04',
    name: 'ZAHR',
    arabic: 'زهر',
    tagline: 'Orange blossom, past midnight.',
    story:
      'Orange blossom picked at night, when the oil is heaviest and the street is quiet. Jasmine sambac lifts it, honey keeps it from going clean. The most worn perfume in the house and the least polite.',
    top: [{ name: 'Orange blossom', note: 'white floral' }],
    heart: [
      { name: 'Jasmine sambac', note: 'indolic' },
      { name: 'Honey', note: 'thick' },
    ],
    base: [
      { name: 'Sandalwood', note: 'cream' },
      { name: 'Benzoin', note: 'resin' },
    ],
    juice: '#e8c96f',
    light: '#ffd98a',
    concentration: 'Extrait de parfum · 26%',
    size: '50 ml',
    price: 210,
    sillage: 4,
    longevity: 4,
    year: '2024',
  },
  {
    slug: 'raml',
    index: '05',
    name: 'RAML',
    arabic: 'رمل',
    tagline: 'Ambergris on warm skin. Nothing else.',
    story:
      'The quietest thing we make, and the one people ask about. Ambergris, cedar and three musks — no top note at all. It reads as your own skin turned up, which is why nobody can place it and everybody notices.',
    top: [],
    heart: [
      { name: 'Ambergris', note: 'salt-warm' },
      { name: 'Iris butter', note: 'powder' },
    ],
    base: [
      { name: 'Atlas cedar', note: 'dry wood' },
      { name: 'Triple musk', note: 'skin' },
    ],
    juice: '#b9a086',
    light: '#f6d3ab',
    concentration: 'Extrait de parfum · 28%',
    size: '50 ml',
    price: 265,
    sillage: 2,
    longevity: 5,
    year: '2025',
  },
]

export const DISCOVERY = {
  slug: 'discovery',
  index: '—',
  name: 'The Discovery Set',
  arabic: 'مجموعة',
  tagline: 'All five, 2 ml each.',
  price: 65,
  size: '5 × 2 ml',
  juice: '#c9a86f',
  light: '#f0c98d',
}

export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug)

export const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
  }).format(n)
