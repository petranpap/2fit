import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme/tokens';
import { validateLoginForm } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateLoginForm({ email, password });
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      setSubmitError(error.message === 'Request failed' ? 'Λάθος email ή κωδικός.' : error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>2fit</Text>
        <Text style={styles.title}>Καλωσόρισες πίσω</Text>
        <Text style={styles.subtitle}>Συνδέσου για να συνεχίσεις.</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="name@example.com"
        />
        <TextField
          label="Κωδικός"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoComplete="password"
          placeholder="••••••••"
        />

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <Button label="Σύνδεση" onPress={handleSubmit} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Δεν έχεις λογαριασμό;</Text>
        <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
          {' '}Εγγραφή
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing['2xl'],
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
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
});
