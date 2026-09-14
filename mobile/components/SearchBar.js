import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Two modes: a read-only entry point (Home — tap navigates to the Search
 * screen) or a live, editable input (Search screen itself, which owns the
 * actual query state and calls the API). `placeholder` is required — callers
 * pass a translated string via t('common.searchPlaceholder').
 */
export default function SearchBar({
  value,
  onChangeText,
  onPress,
  editable = true,
  placeholder,
  autoFocus = false,
  style,
}) {
  if (!editable) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.bar, style, pressed && styles.pressed]}>
        <Text style={styles.placeholder}>{placeholder}</Text>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.bar, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
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
  placeholder: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  input: {
    ...typography.body,
    flex: 1,
    padding: 0,
    marginRight: spacing.sm,
  },
});
