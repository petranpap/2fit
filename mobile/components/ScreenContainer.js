import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme/tokens';

/**
 * Shared shell for form-heavy screens: safe area, keyboard avoidance, and a
 * scrollable, padded body so content never sits under the status bar or the
 * keyboard.
 */
export default function ScreenContainer({ children, style, edges = ['top', 'bottom'] }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
});
