import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { colors, spacing, typography } from '../theme/tokens';

// Real favorite-toggling lands in Sprint 4 alongside offers — this is the
// empty state so the tab isn't a dead end in the meantime.
export default function FavoritesScreen() {
  return (
    <ScreenContainer style={styles.content} edges={['top']}>
      <Ionicons name="heart-outline" size={40} color={colors.textSecondary} />
      <Text style={styles.title}>Δεν έχεις αποθηκεύσει τίποτα ακόμα</Text>
      <Text style={styles.subtitle}>
        Τα αγαπημένα σου γυμναστήρια, προπονητές και καταστήματα θα εμφανίζονται εδώ.
      </Text>
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
