// Maps a category slug (or a place type) to an Ionicons glyph name.
const ICONS_BY_SLUG = {
  // Main categories (Home quick-browse, Explore top categories)
  gyms: 'barbell-outline',
  'martial-arts': 'body-outline',
  wellness: 'flower-outline',
  'personal-trainers': 'person-outline',
  shops: 'storefront-outline',

  // Subcategories
  gym: 'barbell-outline',
  crossfit: 'flame-outline',
  kickboxing: 'flash-outline',
  mma: 'shield-outline',
  'personal-training': 'person-outline',
  'yoga-pilates': 'flower-outline',
  sportswear: 'shirt-outline',
  supplements: 'flask-outline',
};

const ICONS_BY_TYPE = {
  gym: 'barbell-outline',
  trainer: 'person-outline',
  shop: 'storefront-outline',
};

const DEFAULT_ICON = 'pricetag-outline';

export function getCategoryIcon(slug) {
  return ICONS_BY_SLUG[slug] ?? DEFAULT_ICON;
}

export function getTypeIcon(type) {
  return ICONS_BY_TYPE[type] ?? DEFAULT_ICON;
}
