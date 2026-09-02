import { useCallback, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMyDiscountCodes } from '../api/discountCodes';
import DiscountCodeCard from '../components/DiscountCodeCard';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function FavoritesScreen() {
  const { t } = useLocale();
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Re-fetch every time the tab regains focus — a code claimed on
  // OfferDetailScreen should show up here without a manual refresh.
  useFocusEffect(
    useCallback(() => {
      let isCancelled = false;

      fetchMyDiscountCodes()
        .then(({ data }) => {
          if (!isCancelled) setCodes(data);
        })
        .catch(() => {
          if (!isCancelled) setCodes([]);
        })
        .finally(() => {
          if (!isCancelled) setIsLoading(false);
        });

      return () => {
        isCancelled = true;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : codes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="pricetag-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>{t('favorites.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('favorites.emptySubtitle')}</Text>
        </View>
      ) : (
        <FlatList
          data={codes}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => <DiscountCodeCard discountCode={item} />}
          contentContainerStyle={styles.list}
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
  spinner: {
    marginTop: spacing.xl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.subheading,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    padding: spacing.xl,
  },
});
