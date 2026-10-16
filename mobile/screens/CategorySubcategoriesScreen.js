import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchCategoryChildren } from '../api/categories';
import CategoryGridCard from '../components/CategoryGridCard';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';

/**
 * Explore's drill-down: tapping a main category (Gyms, Martial Arts, ...)
 * lands here instead of filtering results immediately, showing that
 * category's subcategories so the person picks a specific one next.
 */
export default function CategorySubcategoriesScreen({ route, navigation }) {
  const { category } = route.params;
  const { t } = useLocale();

  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({ headerTitle: category.name });
  }, [navigation, category.name]);

  useEffect(() => {
    fetchCategoryChildren(category.id)
      .then(({ data }) => setSubcategories(data))
      .catch(() => setError(t('search.error')))
      .finally(() => setIsLoading(false));
  }, [category.id, t]);

  const handleSelect = (subcategory) => {
    // CategorySubcategories is pushed above the tab navigator, so reaching
    // the Search tab needs the nested navigate form (same pattern as
    // FiltersScreen's handleApply).
    navigation.navigate('MainTabs', {
      screen: 'Search',
      params: { category: subcategory.slug },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Text style={styles.subtitle}>{t('categoryBrowse.subtitle')}</Text>

      {isLoading ? (
        <ActivityIndicator color="#FFD400" style={styles.spinner} />
      ) : error || subcategories.length === 0 ? (
        <Text style={styles.message}>{error ?? t('categoryBrowse.empty')}</Text>
      ) : (
        <View style={styles.grid}>
          {subcategories.map((item) => (
            <View key={item.id} style={styles.cardWrap}>
              <CategoryGridCard category={item} onPress={() => handleSelect(item)} />
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
    padding: spacing.xl,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#D8D8D8',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardWrap: {
    width: '48%',
    borderRadius: 18,
  },
  spinner: {
    marginTop: spacing.xl,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#CFCFCF',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
