import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';
import { formatDiscount } from '../utils/offers';

const STATUS_KEYS = {
  redeemed: 'offers.statusRedeemed',
  expired: 'offers.statusExpired',
};

export default function DiscountCodeCard({ discountCode }) {
  const { t } = useLocale();
  const navigation = useNavigation();
  const { offer } = discountCode;
  const statusKey = STATUS_KEYS[discountCode.status];

  return (
    <Pressable
      onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id, code: discountCode.code })}
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
        <Text style={styles.code}>{discountCode.code}</Text>
      </View>

      {statusKey ? (
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{t(statusKey)}</Text>
        </View>
      ) : null}
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
  code: {
    ...typography.caption,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginLeft: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
