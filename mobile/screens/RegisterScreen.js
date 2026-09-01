import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';
import { validateRegisterForm } from '../utils/validation';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateRegisterForm({ name, email, phone, password, passwordConfirmation }, t);
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
        <Text style={styles.title}>{t('auth.register.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label={t('auth.register.nameLabel')}
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoComplete="name"
          placeholder={t('auth.register.namePlaceholder')}
        />
        <TextField
          label={t('auth.register.emailLabel')}
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder={t('auth.register.emailPlaceholder')}
        />
        <TextField
          label={t('auth.register.phoneLabel')}
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder={t('auth.register.phonePlaceholder')}
        />
        <TextField
          label={t('auth.register.passwordLabel')}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoComplete="password-new"
          placeholder={t('auth.register.passwordPlaceholder')}
        />
        <TextField
          label={t('auth.register.confirmLabel')}
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          error={errors.passwordConfirmation}
          secureTextEntry
          autoComplete="password-new"
          placeholder={t('auth.register.confirmPlaceholder')}
        />

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <Button label={t('auth.register.submit')} onPress={handleSubmit} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('auth.register.hasAccount')}</Text>
        <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
          {' '}{t('auth.register.loginLink')}
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
