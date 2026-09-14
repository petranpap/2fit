import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Home's promo card — citrus/secondary accent per design.md ("vivid
 * mandarin/citrus; energy accent for CTAs, offers, highlights"). No stock
 * photo — a flat color card keeps it honest instead of faking real content.
 * Tapping it opens the real deals list (Sprint 4), not a dead end.
 */
export default function PromoBanner() {
  const { t } = useLocale();
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.navigate('Offers')}
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
    >
      <Text style={styles.title}>
        {t('home.bannerTitlePlain')}
        <Text style={styles.titleAccent}>{t('home.bannerTitleAccent')}</Text>
      </Text>
      <Text style={styles.subtitle}>{t('home.bannerSubtitle')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  pressed: {
    opacity: 0.9,
  },
  title: {
    ...typography.subheading,
    color: colors.surface,
  },
  titleAccent: {
    fontFamily: typography.heading.fontFamily,
  },
  subtitle: {
    ...typography.body,
    color: colors.surface,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
});
