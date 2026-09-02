import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';
import { getFacilityIcon } from '../utils/facilityIcons';

// Static (non-pressable) display tile — same icon-circle-over-label shape as
// CategoryIconTile, since facilities are informational, not a filter.
export default function FacilityTile({ facility }) {
  return (
    <View style={styles.tile}>
      <View style={styles.iconCircle}>
        <Ionicons name={getFacilityIcon(facility.slug)} size={20} color={colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {facility.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    width: 72,
    marginRight: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
