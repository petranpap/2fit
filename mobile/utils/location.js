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
