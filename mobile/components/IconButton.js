import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius } from '../theme/tokens';

export default function IconButton({ name, onPress, size = 20, variant = 'surface', accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.surface,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={name} size={size} color={variant === 'primary' ? colors.surface : colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  surface: {
    backgroundColor: colors.surface,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
