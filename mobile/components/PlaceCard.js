import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { toggleFavorite } from '../api/favorites';
import { useLocale } from '../i18n/LocaleContext';
import { getTypeIcon } from '../utils/categoryIcons';

export default function PlaceCard({ place }) {
  const { t } = useLocale();
  const navigation = useNavigation();
  const categoryNames = place.categories?.map((c) => c.name).join(' · ');
  const [isFavorited, setIsFavorited] = useState(Boolean(place.is_favorited));

  const handleFavorite = () => {
    const next = !isFavorited;
    setIsFavorited(next);

    toggleFavorite(place.type, place.id).catch(() => setIsFavorited(!next));
  };

  return (
    <Pressable
      onPress={() => navigation.navigate('PlaceDetail', { type: place.type, id: place.id, distanceKm: place.distance_km })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {place.image_url ? (
          <Image key={place.image_url} source={{ uri: place.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name={getTypeIcon(place.type)} size={26} color="#FFD400" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          {place.is_verified ? <Ionicons name="checkmark-circle" size={15} color="#FFD400" /> : null}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.typeBadge}>{t(`placeTypes.${place.type}`)}</Text>

          {place.rating_avg != null ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFD400" />
              <Text style={styles.ratingText}>
                {place.rating_avg} ({place.reviews_count})
              </Text>
            </View>
          ) : null}

          {place.distance_km != null ? <Text style={styles.distance}>{place.distance_km.toFixed(1)} km</Text> : null}
        </View>

        {place.address ? (
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        ) : null}

        {categoryNames ? (
          <Text style={styles.categories} numberOfLines={1}>
            {categoryNames}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleFavorite}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('placeDetail.favoriteA11y')}
        style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}
      >
        <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={20} color={isFavorited ? '#FFD400' : '#8A8A8A'} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    padding: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrap: {
    width: 76,
    height: 76,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  typeBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD400',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D8D8D8',
  },
  distance: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  address: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9A9A9A',
    marginBottom: 2,
  },
  categories: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7A7A7A',
  },
  favoriteButton: {
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
