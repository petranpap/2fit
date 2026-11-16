import { useEffect, useMemo, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { DARK_MAP_STYLE } from '../utils/darkMapStyle';

/**
 * Explore's map view — dark-styled MapView with custom rating-badge markers
 * (yellow pill with the real average rating, or a plain dot when a place has
 * no reviews yet — never a fabricated number). Default provider: Apple Maps
 * on iOS (no API key needed, supports userInterfaceStyle="dark" natively),
 * Google Maps on Android (customMapStyle gives the dark look there; no API
 * key needed in Expo Go / local dev, only for a production Android build).
 */
export default function PlacesMap({ places, userCoords, selectedKey, onSelectPlace }) {
  const mapRef = useRef(null);

  const initialRegion = useMemo(
    () => ({
      latitude: userCoords?.lat ?? 34.7071,
      longitude: userCoords?.lng ?? 33.0226,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    }),
    // Only the very first coords matter for the initial camera — re-centering
    // on every coords change would fight anyone panning the map themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Two-way sync with an external list/carousel: selecting a card there
  // (not just tapping a marker directly) re-centers the map on it.
  useEffect(() => {
    if (!selectedKey) return;

    const place = places.find((candidate) => `${candidate.type}-${candidate.id}` === selectedKey);
    if (!place || place.latitude == null || place.longitude == null) return;

    mapRef.current?.animateToRegion(
      {
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      300
    );
  }, [selectedKey, places]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={initialRegion}
      userInterfaceStyle="dark"
      customMapStyle={Platform.OS === 'android' ? DARK_MAP_STYLE : undefined}
      showsUserLocation
      showsMyLocationButton={false}
    >
      {places
        .filter((place) => place.latitude != null && place.longitude != null)
        .map((place) => {
          const isSelected = `${place.type}-${place.id}` === selectedKey;
          const hasRating = place.rating_avg != null;

          return (
            <Marker
              key={`${place.type}-${place.id}`}
              coordinate={{ latitude: Number(place.latitude), longitude: Number(place.longitude) }}
              onPress={() => onSelectPlace?.(place)}
              zIndex={isSelected ? 2 : 1}
            >
              <View style={[styles.badge, isSelected ? styles.badgeSelected : styles.badgeNormal]}>
                {hasRating ? (
                  <>
                    <Ionicons name="star" size={11} color={isSelected ? '#FFD400' : '#111111'} />
                    <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>{place.rating_avg}</Text>
                  </>
                ) : (
                  <View style={[styles.dot, isSelected && styles.dotSelected]} />
                )}
              </View>
            </Marker>
          );
        })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 2,
  },
  badgeNormal: {
    backgroundColor: '#FFD400',
    borderColor: '#FFFFFF',
  },
  badgeSelected: {
    backgroundColor: '#111111',
    borderColor: '#FFD400',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111111',
  },
  badgeTextSelected: {
    color: '#FFD400',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111111',
  },
  dotSelected: {
    backgroundColor: '#FFD400',
  },
});
