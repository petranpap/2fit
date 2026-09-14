// Maps a facility slug (see backend FacilitySeeder) to an Ionicons glyph name.
const ICONS_BY_SLUG = {
  'free-wifi': 'wifi-outline',
  parking: 'car-outline',
  showers: 'water-outline',
  'locker-room': 'lock-closed-outline',
  cafe: 'cafe-outline',
  'top-quality-equipment': 'barbell-outline',
};

const DEFAULT_ICON = 'checkmark-circle-outline';

export function getFacilityIcon(slug) {
  return ICONS_BY_SLUG[slug] ?? DEFAULT_ICON;
}
