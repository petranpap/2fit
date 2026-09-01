import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';
import { getTypeIcon } from '../utils/categoryIcons';

/**
 * Compact horizontal-carousel card (Home's "Recommended for you" row). No
 * real photos exist yet, so the image slot is a primary-tinted icon block.
 */
export default function PlaceCardCompact({ place }) {
  const { t } = useLocale();

  return (
    <View style={[styles.card, shadows.small]}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name={getTypeIcon(place.type)} size={28} color={colors.primary} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {place.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {t(`placeTypes.${place.type}`)}
        {place.distance_km != null ? ` · ${place.distance_km.toFixed(1)} km` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginRight: spacing.md,
  },
  imagePlaceholder: {
    height: 88,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  meta: {
    ...typography.caption,
    marginTop: 2,
  },
});
