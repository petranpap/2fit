import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../theme/tokens';
import { getTypeIcon } from '../utils/categoryIcons';

const TYPE_LABELS = {
  gym: 'Γυμναστήριο',
  trainer: 'Προπονητής',
  shop: 'Κατάστημα',
};

/**
 * Compact horizontal-carousel card (Home's "Κοντά σου" row). No real photos
 * exist yet, so the image slot is a primary-tinted icon block instead.
 */
export default function PlaceCardCompact({ place }) {
  return (
    <View style={[styles.card, shadows.small]}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name={getTypeIcon(place.type)} size={28} color={colors.primary} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {place.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {TYPE_LABELS[place.type] ?? place.type}
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
