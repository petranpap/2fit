import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { fetchDiscountCode } from '../api/discountCodes';
import { claimOffer, fetchOffer } from '../api/offers';
import Button from '../components/Button';
import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { formatDiscount } from '../utils/offers';

const STATUS_KEYS = {
  redeemed: 'offers.statusRedeemed',
  expired: 'offers.statusExpired',
};

export default function OfferDetailScreen({ route, navigation }) {
  const { offerId, code } = route.params;
  const { t } = useLocale();
  const [offer, setOffer] = useState(null);
  const [discountCode, setDiscountCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOffer(offerId)
      .then(({ data }) => {
        setOffer(data);
        navigation.setOptions({ headerTitle: data.title });
      })
      .catch((err) => {
        console.error('fetchOffer failed', err);
        setError(err.message && err.message !== 'Request failed' ? err.message : t('offers.notFound'));
      })
      .finally(() => setIsLoading(false));
  }, [offerId]);

  // Arrived from Saved Deals — the code already exists, fetch it (with its
  // QR) instead of going through claim again.
  useEffect(() => {
    if (!code) return;

    fetchDiscountCode(code)
      .then(({ data }) => setDiscountCode(data))
      .catch(() => setError(t('offers.notFound')));
  }, [code]);

  const handleClaim = async () => {
    setIsClaiming(true);
    setError(null);
    try {
      const { data } = await claimOffer(offerId);
      setDiscountCode(data);
    } catch (err) {
      // Surface the server's actual reason (e.g. "not currently active",
      // or an auth error) instead of a one-size-fits-all message — both
      // for the user and for debugging.
      console.error('claimOffer failed', err);
      setError(err.message && err.message !== 'Request failed' ? err.message : t('offers.claimError'));
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!offer) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <Text style={styles.message}>{error ?? t('offers.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const statusKey = discountCode ? STATUS_KEYS[discountCode.status] : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{formatDiscount(offer, t)}</Text>
        </View>

        <Text style={styles.title}>{offer.title}</Text>
        {offer.offerable ? <Text style={styles.at}>{t('offers.at', { name: offer.offerable.name })}</Text> : null}
        {offer.description ? <Text style={styles.description}>{offer.description}</Text> : null}
        {offer.expires_at ? (
          <Text style={styles.expiry}>
            {t('offers.expiresOn', { date: new Date(offer.expires_at).toLocaleDateString() })}
          </Text>
        ) : null}

        {discountCode ? (
          <View style={styles.codeSection}>
            <Text style={styles.sectionTitle}>{t('offers.claimedTitle')}</Text>
            <Text style={styles.codeSubtitle}>{t('offers.claimedSubtitle')}</Text>

            {discountCode.qr_svg ? (
              <View style={styles.qrFrame}>
                <SvgXml xml={discountCode.qr_svg} width={200} height={200} />
              </View>
            ) : null}

            <Text style={styles.code}>{discountCode.code}</Text>

            {statusKey ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{t(statusKey)}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.claimSection}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button label={isClaiming ? t('offers.claiming') : t('offers.claimButton')} onPress={handleClaim} loading={isClaiming} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  badgeText: {
    ...typography.bodyStrong,
    color: colors.surface,
  },
  title: {
    ...typography.heading,
    fontSize: 22,
  },
  at: {
    ...typography.body,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  expiry: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  claimSection: {
    marginTop: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  codeSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.subheading,
  },
  codeSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  qrFrame: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  code: {
    ...typography.heading,
    fontSize: 20,
    letterSpacing: 1,
  },
  statusPill: {
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
