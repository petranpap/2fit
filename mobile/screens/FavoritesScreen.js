import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';

// Real favorite-toggling lands in Sprint 4 alongside offers — this is the
// empty state so the tab isn't a dead end in the meantime.
export default function FavoritesScreen() {
  const { t } = useLocale();

  return (
    <ScreenContainer style={styles.content} edges={['top']}>
      <Ionicons name="heart-outline" size={40} color={colors.textSecondary} />
      <Text style={styles.title}>{t('favorites.emptyTitle')}</Text>
      <Text style={styles.subtitle}>{t('favorites.emptySubtitle')}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.subheading,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
