import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer style={styles.content}>
      <Text style={styles.wordmark}>2fit</Text>
      <Text style={styles.title}>Γεια σου, {user?.name ?? ''}!</Text>
      <Text style={styles.subtitle}>Home screen placeholder — Sprint 2 replaces this.</Text>

      <View style={styles.footer}>
        <Button label="Αποσύνδεση" variant="secondary" onPress={logout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  wordmark: {
    ...typography.subheading,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  footer: {
    marginTop: spacing.xl,
  },
});
