
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../components/Button';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { spacing, typography } from '../theme/tokens';
import { validateLoginForm } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t, locale } = useLocale();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateLoginForm(
      { email, password },
      t
    );

    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch (error) {
      setSubmitError(
        error.message === 'Request failed'
          ? t('auth.login.badCredentials')
          : error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      locale === 'el' ? 'Ξέχασα τον κωδικό' : 'Forgot password',
      locale === 'el'
        ? 'Η λειτουργία επαναφοράς κωδικού θα προστεθεί σύντομα.'
        : 'Password reset will be available soon.'
    );
  };

  return (
    <ScreenContainer style={styles.content}>

      <View style={styles.card}>

        {/* LANGUAGE SWITCHER */}
        <View style={styles.languageRow}>
          <LanguageSwitcher />
        </View>

        {/* 2FIT LOGO */}
        <Image
          source={require('../assets/2fit.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* LOGIN TITLE */}
        <Text style={styles.title}>
          {t('auth.login.submit')}
        </Text>

        {/* FORM */}
        <View style={styles.form}>

          <TextField
            label={t('auth.login.emailLabel')}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder={t('auth.login.emailPlaceholder')}
          />

          <TextField
            label={t('auth.login.passwordLabel')}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry={!showPassword}
            autoComplete="password"
            placeholder={t('auth.login.passwordPlaceholder')}
          />

          {/* SHOW PASSWORD */}
          <Pressable
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.passwordToggleText}>
              {locale === 'el'
                ? showPassword
                  ? '👁 Απόκρυψη κωδικού'
                  : '👁 Εμφάνιση κωδικού'
                : showPassword
                  ? '👁 Hide password'
                  : '👁 Show password'}
            </Text>
          </Pressable>

          {/* FORGOT PASSWORD */}
          <Pressable
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              {locale === 'el'
                ? 'Ξέχασα τον κωδικό;'
                : 'Forgot password?'}
            </Text>
          </Pressable>

          {submitError ? (
            <Text style={styles.submitError}>
              {submitError}
            </Text>
          ) : null}

          {/* LOGIN BUTTON */}
          <Pressable
            style={styles.loginButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.loginButtonText}>
              {isSubmitting
                ? locale === 'el'
                  ? 'Παρακαλώ περιμένετε...'
                  : 'Please wait...'
                : t('auth.login.submit')}
            </Text>
          </Pressable>

        </View>

        {/* REGISTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('auth.login.noAccount')}
          </Text>

          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate('Register')}
          >
            {' '}{t('auth.login.registerLink')}
          </Text>
        </View>

      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({

  content: {
    justifyContent: 'center',
    backgroundColor: '#090909',
  },

  card: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',

    backgroundColor: '#111111',

    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 22,

    padding: spacing.xl,
  },

  languageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },

  logo: {
    width: '100%',
    height: 300,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },

  title: {
    ...typography.heading,

    fontSize: 28,
    textAlign: 'center',

    color: '#FFD400',

    marginBottom: spacing.xl,
  },

  form: {
    marginBottom: spacing.xl,
  },

  passwordToggle: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 6,
  },

  passwordToggleText: {
    ...typography.bodyStrong,
    color: '#FFD400',
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },

  forgotPasswordText: {
    ...typography.body,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },

  submitError: {
    ...typography.caption,
    color: '#FF5A5A',
    marginBottom: spacing.md,
  },

  loginButton: {
    backgroundColor: '#FFD400',

    paddingVertical: 16,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: spacing.sm,
  },

  loginButtonText: {
    ...typography.bodyStrong,

    color: '#000000',
    fontSize: 17,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  footerText: {
    ...typography.body,
    color: '#FFFFFF',
  },

  footerLink: {
    ...typography.bodyStrong,
    color: '#FFD400',
  },

});