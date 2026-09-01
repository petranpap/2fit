import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

export default function PlaceCard({ place }) {
  const { t } = useLocale();
  const navigation = useNavigation();
  const categoryNames = place.categories?.map((c) => c.name).join(' · ');

  return (
    <Pressable
      onPress={() => navigation.navigate('PlaceDetail', { type: place.type, id: place.id, distanceKm: place.distance_km })}
      style={({ pressed }) => [styles.card, shadows.small, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        {place.is_verified ? <Text style={styles.verified}>✓</Text> : null}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.typeBadge}>{t(`placeTypes.${place.type}`)}</Text>
        {place.distance_km != null ? (
          <Text style={styles.distance}>{place.distance_km.toFixed(1)} km</Text>
        ) : null}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.bodyStrong,
    flexShrink: 1,
  },
  verified: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    ...typography.caption,
    color: colors.primary,
  },
  distance: {
    ...typography.caption,
    marginLeft: spacing.sm,
  },
  address: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  categories: {
    ...typography.caption,
  },
});
