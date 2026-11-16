
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';
import { validateRegisterForm } from '../utils/validation';

// Χρώματα της σελίδας εγγραφής.
// Πριν από το PR, θα τα ευθυγραμμίσουμε με docs/design.md.
const YELLOW = '#FFD600';
const BLACK = '#101010';
const CARD = '#1A1A1A';
const WHITE = '#FFFFFF';
const TEXT_BLACK = '#000000';

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
    if (isSubmitting) return;

    const validationErrors = validateRegisterForm(
      { name, email, phone, password, passwordConfirmation },
      t
    );

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
          serverErrors[
            field === 'password_confirmation'
              ? 'passwordConfirmation'
              : field
          ] = messages[0];
        }

        setErrors((prev) => ({ ...prev, ...serverErrors }));
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = ({
    label,
    value,
    onChangeText,
    error,
    placeholder,
    ...props
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#737373"
        selectionColor={YELLOW}
        {...props}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>

        <View style={styles.languageRow}>
          <LanguageSwitcher />
        </View>

        <View style={styles.header}>
          <Text style={styles.logo}>
            <Text style={styles.logoYellow}>2</Text>Fit
          </Text>

          <Text style={styles.title}>
            {t('auth.register.title')}
          </Text>

          <Text style={styles.subtitle}>
            {t('auth.register.subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          {renderField({
            label: t('auth.register.nameLabel'),
            value: name,
            onChangeText: setName,
            error: errors.name,
            placeholder: t('auth.register.namePlaceholder'),
            autoComplete: 'name',
          })}

          {renderField({
            label: t('auth.register.emailLabel'),
            value: email,
            onChangeText: setEmail,
            error: errors.email,
            placeholder: t('auth.register.emailPlaceholder'),
            autoCapitalize: 'none',
            keyboardType: 'email-address',
            autoComplete: 'email',
          })}

          {renderField({
            label: t('auth.register.phoneLabel'),
            value: phone,
            onChangeText: setPhone,
            error: errors.phone,
            placeholder: t('auth.register.phonePlaceholder'),
            keyboardType: 'phone-pad',
            autoComplete: 'tel',
          })}

          {renderField({
            label: t('auth.register.passwordLabel'),
            value: password,
            onChangeText: setPassword,
            error: errors.password,
            placeholder: t('auth.register.passwordPlaceholder'),
            secureTextEntry: true,
            autoComplete: 'password-new',
          })}

          {renderField({
            label: t('auth.register.confirmLabel'),
            value: passwordConfirmation,
            onChangeText: setPasswordConfirmation,
            error: errors.passwordConfirmation,
            placeholder: t('auth.register.confirmPlaceholder'),
            secureTextEntry: true,
            autoComplete: 'password-new',
          })}

          {submitError ? (
            <Text style={styles.errorText}>
              {submitError}
            </Text>
          ) : null}

          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator color={TEXT_BLACK} />
            ) : (
              <Text style={styles.submitButtonText}>
                {t('auth.register.submit')}
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('auth.register.hasAccount')}{' '}
          </Text>

          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate('Login')}
          >
            {t('auth.register.loginLink')}
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BLACK,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },

  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: CARD,
    borderWidth: 2,
    borderColor: YELLOW,
    borderRadius: 20,
    padding: spacing.lg,
  },

  languageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: WHITE,
    marginBottom: spacing.md,
  },

  logoYellow: {
    color: YELLOW,
  },

  title: {
    ...typography.heading,
    color: YELLOW,
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 34,
  },

  subtitle: {
    ...typography.body,
    color: WHITE,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  form: {
    gap: spacing.md,
  },

  field: {
    gap: spacing.xs,
  },

  label: {
    ...typography.bodyStrong,
    color: YELLOW,
  },

  input: {
    backgroundColor: WHITE,
    color: TEXT_BLACK,
    borderWidth: 1,
    borderColor: WHITE,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    minHeight: 50,
  },

  inputError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },

  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },

  submitButton: {
    backgroundColor: YELLOW,
    padding: spacing.md,
    minHeight: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },

  submitButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT_BLACK,
  },

  disabledButton: {
    opacity: 0.6,
  },

  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.sm,
  },

  footerText: {
    ...typography.body,
    color: WHITE,
  },

  footerLink: {
    ...typography.bodyStrong,
    color: YELLOW,
  },
});
