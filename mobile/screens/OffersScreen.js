import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchOffers } from '../api/offers';
import OfferCard from '../components/OfferCard';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function OffersScreen() {
  const { t } = useLocale();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOffers()
      .then(({ data }) => setOffers(data))
      .catch(() => setError(t('offers.error')))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <OfferCard offer={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.message}>{error ?? t('offers.empty')}</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.xl,
    flexGrow: 1,
  },
  spinner: {
    marginTop: spacing.xl,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
