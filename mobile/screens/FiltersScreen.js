import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import CategoryIconTile from '../components/CategoryIconTile';
import { useCategories } from '../hooks/useCategories';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';

const DISTANCE_KM_VALUES = [1, 5, 10, 25, 50];

export default function FiltersScreen({ route, navigation }) {
  const { categories } = useCategories();
  const { t } = useLocale();
  const [category, setCategory] = useState(route.params?.category ?? null);
  const [radiusKm, setRadiusKm] = useState(route.params?.radiusKm ?? null);

  const handleApply = () => {
    // Filters is pushed above the tab navigator (MainTabs), so reaching the
    // Search tab needs the nested navigate form, not a flat screen name.
    navigation.navigate('MainTabs', {
      screen: 'Search',
      params: { category, radiusKm, filtersAppliedAt: Date.now() },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('filters.categorySection')}</Text>
        <View style={styles.categoriesWrap}>
          {categories.map((item) => (
            <CategoryIconTile
              key={item.id}
              category={item}
              selected={category === item.slug}
              onPress={() => setCategory(category === item.slug ? null : item.slug)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('filters.distanceSection')}</Text>
        <View style={styles.chipsWrap}>
          {DISTANCE_KM_VALUES.map((km) => (
            <CategoryChip
              key={km}
              label={`${km} km`}
              selected={radiusKm === km}
              onPress={() => setRadiusKm(km)}
            />
          ))}
          <CategoryChip
            label={t('filters.distanceAll')}
            selected={radiusKm === null}
            onPress={() => setRadiusKm(null)}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={t('filters.apply')} onPress={handleApply} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.subheading,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
