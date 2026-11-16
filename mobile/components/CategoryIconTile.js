import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';
import { getCategoryIcon } from '../utils/categoryIcons';

export default function CategoryIconTile({ category, selected = false, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
        <Ionicons name={getCategoryIcon(category.slug)} size={22} color={selected ? colors.surface : colors.primary} />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    width: 76,
    marginRight: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconCircleSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.primary,
    fontFamily: typography.bodyStrong.fontFamily,
  },
});
