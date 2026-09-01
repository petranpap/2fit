import { StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

export default function PlaceCard({ place }) {
  const { t } = useLocale();
  const categoryNames = place.categories?.map((c) => c.name).join(' · ');

  return (
    <View style={[styles.card, shadows.small]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
