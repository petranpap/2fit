import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { getTypeIcon } from '../utils/categoryIcons';

/**
 * Compact horizontal-carousel card — Home's "Recommended for you" row and
 * Explore's map-view bottom carousel both use this. Welby-style: a real
 * photo fills the top (falling back to a dark icon block when the listing
 * has none yet), distance as a small badge over the photo, name + address
 * below — rating only shows when the place actually has reviews.
 */
export default function PlaceCardCompact({ place, selected = false, onPress }) {
  const { t } = useLocale();
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    navigation.navigate('PlaceDetail', { type: place.type, id: place.id, distanceKm: place.distance_km });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {place.image_url ? (
          <Image key={place.image_url} source={{ uri: place.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name={getTypeIcon(place.type)} size={30} color="#FFD400" />
          </View>
        )}

        {place.distance_km != null ? (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceBadgeText}>{place.distance_km.toFixed(1)} km</Text>
          </View>
        ) : null}

        {place.rating_avg != null ? (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#111111" />
            <Text style={styles.ratingBadgeText}>{place.rating_avg}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {place.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {place.address ?? t(`placeTypes.${place.type}`)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 10,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  cardSelected: {
    borderColor: '#FFD400',
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrap: {
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 128,
    borderRadius: 14,
  },
  imagePlaceholder: {
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(17, 17, 17, 0.75)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFD400',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111111',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9A9A9A',
    marginTop: 2,
  },
});
