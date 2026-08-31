import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { search } from '../api/search';
import CategoryIconTile from '../components/CategoryIconTile';
import IconButton from '../components/IconButton';
import PlaceCardCompact from '../components/PlaceCardCompact';
import ScreenContainer from '../components/ScreenContainer';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { colors, spacing, typography } from '../theme/tokens';
import { getCurrentCoords } from '../utils/location';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [nearby, setNearby] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(true);

  useEffect(() => {
    getCurrentCoords()
      .then((coords) => search({ ...coords, perPage: 6 }))
      .then(({ data }) => setNearby(data))
      .catch(() => setNearby([]))
      .finally(() => setIsLoadingNearby(false));
  }, []);

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Γεια σου, {user?.name ?? ''} 👋</Text>
        <Text style={styles.subtitle}>Έτοιμος/η να ανακαλύψεις κάτι νέο κοντά σου;</Text>
      </View>

      <View style={styles.searchRow}>
        <SearchBar editable={false} onPress={() => navigation.navigate('Search')} style={styles.searchBar} />
        <IconButton
          name="options-outline"
          accessibilityLabel="Φίλτρα"
          onPress={() => navigation.navigate('Filters')}
        />
      </View>

      {categories.length > 0 ? (
        // Plain View wrapper with a fixed height — react-native-web's FlatList
        // forces flex:1 internally, which ignores a height set on its own
        // `style` prop, so the height has to come from a constrained parent.
        <View style={styles.categoriesWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CategoryIconTile
                category={item}
                onPress={() => navigation.navigate('Search', { category: item.slug })}
              />
            )}
          />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Κοντά σου</Text>

      {isLoadingNearby ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : nearby.length === 0 ? (
        <Text style={styles.emptyMessage}>Δεν βρέθηκαν αποτελέσματα κοντά σου.</Text>
      ) : (
        <View style={styles.nearbyWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={nearby}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => <PlaceCardCompact place={item} />}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.heading,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  searchBar: {
    flex: 1,
  },
  categoriesWrap: {
    height: 92,
    marginBottom: spacing.xl,
  },
  nearbyWrap: {
    height: 172,
  },
  sectionTitle: {
    ...typography.subheading,
    marginBottom: spacing.md,
  },
  spinner: {
    marginTop: spacing.lg,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
