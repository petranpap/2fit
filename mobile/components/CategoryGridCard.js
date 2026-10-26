import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';
import { getCategoryIcon } from '../utils/categoryIcons';

/**
 * Explore's "Top categories" 2-up grid card (and the subcategory drill-down
 * grid). Main categories carry a photo (image_url, seeded from Unsplash for
 * now — see CategorySeeder); subcategories don't have one yet, so those
 * render the plain dark icon-block card instead of a broken/empty photo.
 * Count comes from the API (listings_count), never fabricated.
 */
export default function CategoryGridCard({ category, selected = false, onPress }) {
  const { t } = useLocale();
  const [imageFailed, setImageFailed] = useState(false);

  const countLabel =
    category.listings_count != null
      ? t(category.listings_count === 1 ? 'search.listingsOne' : 'search.listings', {
          count: category.listings_count,
        })
      : null;

  if (category.image_url && !imageFailed) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.photoCard, selected && styles.cardSelected, pressed && styles.pressed]}
      >
        <View style={styles.photo}>
          <Image
            key={category.image_url}
            source={{ uri: category.image_url }}
            style={styles.photoImage}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.88)']}
            style={[styles.gradientOverlay, styles.gradient]}
          >
            <View style={styles.photoIconCircle}>
              <Ionicons name={getCategoryIcon(category.slug)} size={16} color="#FFD400" />
            </View>
            <Text style={styles.photoName} numberOfLines={1}>
              {category.name}
            </Text>
            {countLabel ? (
              <Text style={styles.photoCount} numberOfLines={1}>
                {countLabel}
              </Text>
            ) : null}
          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
    >
      <View style={styles.iconBlock}>
        <Ionicons name={getCategoryIcon(category.slug)} size={32} color="#FFD400" />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
      {countLabel ? <Text style={styles.count}>{countLabel}</Text> : null}
    </Pressable>
  );
}

const CARD_HEIGHT = 150;

const styles = StyleSheet.create({
  photoCard: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photo: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  photoIconCircle: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 14,
    backgroundColor: 'rgba(17, 17, 17, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  photoName: {
    flexShrink: 0,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  photoCount: {
    flexShrink: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#E0E0E0',
    marginTop: 1,
  },

  card: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  cardSelected: {
    borderColor: '#FFD400',
  },
  pressed: {
    opacity: 0.8,
  },
  iconBlock: {
    height: 72,
    flexShrink: 0,
    borderRadius: 14,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    flexShrink: 0,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  count: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: '#B8B8B8',
    marginTop: 2,
  },
});
