import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';
import { formatDiscount } from '../utils/offers';

export default function OfferCard({ offer }) {
  const { t } = useLocale();
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
      style={({ pressed }) => [styles.card, shadows.small, pressed && styles.pressed]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{formatDiscount(offer, t)}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {offer.title}
        </Text>
        {offer.offerable ? (
          <Text style={styles.at} numberOfLines={1}>
            {t('offers.at', { name: offer.offerable.name })}
          </Text>
        ) : null}
        {offer.expires_at ? (
          <Text style={styles.expiry}>
            {t('offers.expiresOn', { date: new Date(offer.expires_at).toLocaleDateString() })}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
  },
  badgeText: {
    ...typography.bodyStrong,
    color: colors.surface,
    fontSize: 14,
  },
  body: {
    flex: 1,
  },
  title: {
    ...typography.bodyStrong,
  },
  at: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  expiry: {
    ...typography.caption,
    marginTop: 2,
  },
});
