// Standard dark/"night mode" Google Maps style array (feature/element color
// overrides only — no proprietary data), so the map matches 2fit's black
// background instead of showing a bright default basemap. Android only
// (customMapStyle); iOS gets react-native-maps' own userInterfaceStyle="dark".
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1A1A1A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111111' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8A8A8A' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3A3A3A' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2E2E2E' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9A9A9A' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3A3A3A' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0C0C0C' }] },
];
