import { StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Home's promo card — citrus/secondary accent per design.md ("vivid
 * mandarin/citrus; energy accent for CTAs, offers, highlights"). No stock
 * photo — a flat color card keeps it honest instead of faking real content.
 */
export default function PromoBanner() {
  const { t } = useLocale();

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>
        {t('home.bannerTitlePlain')}
        <Text style={styles.titleAccent}>{t('home.bannerTitleAccent')}</Text>
      </Text>
      <Text style={styles.subtitle}>{t('home.bannerSubtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
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
