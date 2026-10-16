import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';
import { getCategoryIcon } from '../utils/categoryIcons';

/**
 * variant 'light' (default) follows the teal theme tokens — used on
 * FiltersScreen, which hasn't moved to the dark/yellow identity yet.
 * variant 'dark' hardcodes the black-circle/yellow-icon look from Home's
 * mockup, matching that screen's own hardcoded hex styles.
 */
export default function CategoryIconTile({ category, selected = false, onPress, variant = 'light' }) {
  const isDark = variant === 'dark';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View
        style={[
          styles.iconCircle,
          isDark && styles.iconCircleDark,
          selected && (isDark ? styles.iconCircleDarkSelected : styles.iconCircleSelected),
        ]}
      >
        <Ionicons
          name={getCategoryIcon(category.slug)}
          size={22}
          color={isDark ? '#FFD400' : selected ? colors.surface : colors.primary}
        />
      </View>
      <Text
        style={[styles.label, isDark && styles.labelDark, selected && (isDark ? styles.labelDarkSelected : styles.labelSelected)]}
        numberOfLines={1}
      >
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
  iconCircleDark: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
  },
  iconCircleDarkSelected: {
    backgroundColor: '#FFD400',
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
  labelDark: {
    color: '#FFFFFF',
    fontFamily: typography.bodyStrong.fontFamily,
  },
  labelDarkSelected: {
    color: '#FFD400',
  },
});
