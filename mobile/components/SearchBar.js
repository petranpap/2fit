import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Two modes: a read-only entry point (Home — tap navigates to the Search
 * screen) or a live, editable input (Search screen itself, which owns the
 * actual query state and calls the API).
 */
export default function SearchBar({
  value,
  onChangeText,
  onPress,
  editable = true,
  placeholder = 'Αναζήτησε γυμναστήρια, προπονητές, καταστήματα…',
  autoFocus = false,
}) {
  if (!editable) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
        <Text style={styles.icon}>🔍</Text>
        <Text style={styles.placeholder}>{placeholder}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.bar}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  placeholder: {
    ...typography.body,
    color: colors.textSecondary,
  },
  input: {
    ...typography.body,
    flex: 1,
    padding: 0,
  },
});
