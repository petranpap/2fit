import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { fetchDiscountCode } from '../api/discountCodes';
import { claimOffer, fetchOffer } from '../api/offers';
import { useLocale } from '../i18n/LocaleContext';
import { radius, spacing, typography } from '../theme/tokens';
import { formatDiscount } from '../utils/offers';
import { formatOfferDate } from '../utils/formatOfferDate';

// Same black / yellow / white palette as the 2Fit Home and Trainer pages.
const PALETTE = {
  background: '#111111',
  card: '#1B1B1B',
  yellow: '#FFD400',
  white: '#FFFFFF',
  muted: '#C9C9C9',
  error: '#FF8080',
};

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

  // The original navigation config uses the old blue header. Override it
  // only for this screen, without changing other navigation routes.
  useEffect(() => {
    navigation.setOptions({
      headerTintColor: PALETTE.yellow,
      headerStyle: { backgroundColor: PALETTE.background },
      headerTitleStyle: { color: PALETTE.white },
      headerShadowVisible: false,
    });
  }, [navigation]);

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
        <ActivityIndicator color={PALETTE.yellow} />
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
            {t('offers.expiresOn', { date: formatOfferDate(offer.expires_at) })}
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
            <Pressable
              onPress={handleClaim}
              disabled={isClaiming}
              accessibilityRole="button"
              accessibilityState={{ disabled: isClaiming, busy: isClaiming }}
              style={({ pressed }) => [
                styles.claimButton,
                (pressed || isClaiming) && styles.claimButtonPressed,
              ]}
            >
              {isClaiming ? (
                <ActivityIndicator color={PALETTE.background} />
              ) : (
                <Text style={styles.claimButtonText}>{t('offers.claimButton')}</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.background,
    padding: spacing.xl,
  },
  message: {
    ...typography.body,
    color: PALETTE.white,
    textAlign: 'center',
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: PALETTE.yellow,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  badgeText: {
    ...typography.bodyStrong,
    color: PALETTE.background,
  },
  title: {
    ...typography.heading,
    color: PALETTE.white,
    fontSize: 23,
  },
  at: {
    ...typography.body,
    color: PALETTE.yellow,
    marginTop: spacing.xs,
  },
  description: {
    ...typography.body,
    color: PALETTE.white,
    marginTop: spacing.md,
  },
  expiry: {
    ...typography.caption,
    color: PALETTE.muted,
    marginTop: spacing.sm,
  },
  claimSection: {
    marginTop: spacing.xl,
  },
  claimButton: {
    backgroundColor: PALETTE.yellow,
    minHeight: 52,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonPressed: {
    opacity: 0.75,
  },
  claimButtonText: {
    ...typography.bodyStrong,
    color: PALETTE.background,
    textAlign: 'center',
  },
  errorText: {
    ...typography.caption,
    color: PALETTE.error,
    marginBottom: spacing.md,
  },
  codeSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.subheading,
    color: PALETTE.white,
    textAlign: 'center',
  },
  codeSubtitle: {
    ...typography.body,
    color: PALETTE.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  // Keep the QR code on white so scanners can read black modules.
  qrFrame: {
    padding: spacing.md,
    backgroundColor: PALETTE.white,
    borderWidth: 2,
    borderColor: PALETTE.yellow,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  code: {
    ...typography.heading,
    color: PALETTE.yellow,
    fontSize: 20,
    letterSpacing: 1,
    textAlign: 'center',
  },
  statusPill: {
    marginTop: spacing.md,
    backgroundColor: PALETTE.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: PALETTE.white,
  },
});
