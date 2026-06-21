/**
 * Stock Image Utility
 *
 * Returns a relevant Unsplash photo URL based on keywords in the
 * restaurant name/description or menu item category + isVeg flag.
 * Uses Unsplash Source URLs (free, no attribution required for hotlinking).
 */

// ── Restaurant images ──────────────────────────────────────────
const RESTAURANT_IMAGES = [
  { keywords: ['pizza'],                      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop' },
  { keywords: ['burger', 'fast food'],        url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop' },
  { keywords: ['sushi', 'japanese', 'ramen'], url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop' },
  { keywords: ['chaap', 'paneer', 'indian', 'curry', 'naan', 'tandoor', 'biryani'],
                                               url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop' },
  { keywords: ['chinese', 'noodle', 'wok'],   url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop' },
  { keywords: ['cafe', 'coffee', 'bakery'],   url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop' },
];

const DEFAULT_RESTAURANT_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop';

/**
 * Get a stock image for a restaurant based on its name/description.
 * If the restaurant already has a non-empty imageUrl, returns that instead.
 */
export function getRestaurantImage(restaurant) {
  if (restaurant.imageUrl) return restaurant.imageUrl;

  const haystack = `${restaurant.name || ''} ${restaurant.description || ''}`.toLowerCase();

  for (const entry of RESTAURANT_IMAGES) {
    if (entry.keywords.some((kw) => haystack.includes(kw))) {
      return entry.url;
    }
  }
  return DEFAULT_RESTAURANT_IMG;
}

// ── Menu item images ───────────────────────────────────────────
const MENU_IMAGES = {
  // Veg
  veg_starters:    'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&h=300&fit=crop',
  veg_main:        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
  veg_salad:       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  veg_dessert:     'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
  veg_beverage:    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  veg_default:     'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&h=300&fit=crop',

  // Non-Veg
  nonveg_starters: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop',
  nonveg_main:     'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  nonveg_burger:   'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  nonveg_dessert:  'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
  nonveg_beverage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  nonveg_default:  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
};

const CATEGORY_KEYWORDS = {
  starters: ['starter', 'appetizer', 'snack', 'chaat'],
  main:     ['main', 'course', 'entree', 'gravy', 'curry', 'chaap', 'rice', 'biryani', 'naan', 'roti', 'bread'],
  salad:    ['salad', 'raita'],
  dessert:  ['dessert', 'sweet', 'ice cream', 'cake', 'gulab'],
  beverage: ['beverage', 'drink', 'juice', 'lassi', 'shake', 'coffee', 'tea', 'soda', 'cold drink', 'mocktail'],
  burger:   ['burger'],
};

function matchCategory(category) {
  const cat = (category || '').toLowerCase();
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => cat.includes(kw))) return key;
  }
  return 'default';
}

/**
 * Get a stock image for a menu item based on its category and isVeg flag.
 * Falls back to a generic food image.
 */
export function getMenuItemImage(item) {
  const prefix = item.isVeg ? 'veg' : 'nonveg';
  const catKey = matchCategory(item.category);
  const key = `${prefix}_${catKey}`;

  return MENU_IMAGES[key] || MENU_IMAGES[`${prefix}_default`] || MENU_IMAGES.nonveg_default;
}
