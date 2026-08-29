import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme/tokens';
import { validateRegisterForm } from '../utils/validation';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateRegisterForm({ name, email, phone, password, passwordConfirmation });
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        passwordConfirmation,
      });
    } catch (error) {
      if (error.status === 422 && error.errors) {
        const serverErrors = {};
        for (const [field, messages] of Object.entries(error.errors)) {
          serverErrors[field === 'password_confirmation' ? 'passwordConfirmation' : field] = messages[0];
        }
        setErrors((prev) => ({ ...prev, ...serverErrors }));
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.wordmark}>2fit</Text>
        <Text style={styles.title}>Δημιούργησε λογαριασμό</Text>
        <Text style={styles.subtitle}>Βρες γυμναστήρια, προπονητές και προσφορές κοντά σου.</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Όνομα"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoComplete="name"
          placeholder="Το όνομά σου"
        />
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
          label="Τηλέφωνο (προαιρετικό)"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="99 123456"
        />
        <TextField
          label="Κωδικός"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoComplete="password-new"
          placeholder="Τουλάχιστον 8 χαρακτήρες"
        />
        <TextField
          label="Επιβεβαίωση κωδικού"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          error={errors.passwordConfirmation}
          secureTextEntry
          autoComplete="password-new"
          placeholder="Ξαναγράψε τον κωδικό"
        />

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <Button label="Εγγραφή" onPress={handleSubmit} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Έχεις ήδη λογαριασμό;</Text>
        <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
          {' '}Σύνδεση
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  wordmark: {
    ...typography.subheading,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    fontSize: 24,
    lineHeight: 30,
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
    paddingBottom: spacing.xl,
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
