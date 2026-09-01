import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';
import { getCategoryIcon } from '../utils/categoryIcons';

/**
 * Explore's "Top categories" 2-up grid card. No category photography exists
 * yet, so the image slot is the same primary-tinted icon block used
 * elsewhere, just bigger — count comes from the API (listings_count), never
 * fabricated.
 */
export default function CategoryGridCard({ category, selected = false, onPress }) {
  const { t } = useLocale();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadows.small, selected && styles.cardSelected, pressed && styles.pressed]}
    >
      <View style={styles.iconBlock}>
        <Ionicons name={getCategoryIcon(category.slug)} size={32} color={colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
      {category.listings_count != null ? (
        <Text style={styles.count}>
          {t(category.listings_count === 1 ? 'search.listingsOne' : 'search.listings', {
            count: category.listings_count,
          })}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  iconBlock: {
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  count: {
    ...typography.caption,
    marginTop: 2,
  },
});
