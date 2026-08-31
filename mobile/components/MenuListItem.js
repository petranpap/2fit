import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme/tokens';

export default function MenuListItem({ icon, label, onPress, danger = false }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.textPrimary} />
        <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    ...typography.body,
  },
  labelDanger: {
    color: colors.danger,
  },
});
