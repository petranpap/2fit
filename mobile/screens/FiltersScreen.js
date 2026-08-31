import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import CategoryIconTile from '../components/CategoryIconTile';
import { useCategories } from '../hooks/useCategories';
import { colors, spacing, typography } from '../theme/tokens';

const DISTANCE_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: 'Όλες', value: null },
];

export default function FiltersScreen({ route, navigation }) {
  const { categories } = useCategories();
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
        <Text style={styles.sectionTitle}>Κατηγορία</Text>
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

        <Text style={styles.sectionTitle}>Απόσταση</Text>
        <View style={styles.chipsWrap}>
          {DISTANCE_OPTIONS.map((option) => (
            <CategoryChip
              key={option.label}
              label={option.label}
              selected={radiusKm === option.value}
              onPress={() => setRadiusKm(option.value)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Εφαρμογή φίλτρων" onPress={handleApply} />
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
