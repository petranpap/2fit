import * as Location from 'expo-location';

// Limassol city center — used whenever we can't get a real device location
// (permission denied, web, simulator with no location services).
export const DEFAULT_COORDS = { lat: 34.7071, lng: 33.0226 };

export async function getCurrentCoords() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return DEFAULT_COORDS;
    }

    const position = await Location.getCurrentPositionAsync({});

    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch {
    return DEFAULT_COORDS;
  }
}

/**
 * "City, Country" label for the given coords, e.g. for Explore's location
 * row. Returns null on failure (no reverse-geocoding provider on this
 * platform/browser, no network, etc.) — the caller falls back to a generic
 * translated label rather than showing nothing.
 */
export async function getLocationLabel({ lat, lng }) {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });

    if (!place) return null;

    const city = place.city ?? place.subregion ?? place.region;

    return city ? `${city}, ${place.country}` : place.country ?? null;
  } catch {
    return null;
  }
}
