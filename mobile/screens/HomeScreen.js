import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { fetchCategories } from '../api/categories';
import { search } from '../api/search';
import CategoryChip from '../components/CategoryChip';
import PlaceCard from '../components/PlaceCard';
import ScreenContainer from '../components/ScreenContainer';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme/tokens';
import { getCurrentCoords } from '../utils/location';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));

    getCurrentCoords()
      .then((coords) => search({ ...coords, perPage: 4 }))
      .then(({ data }) => setNearby(data))
      .catch(() => setNearby([]))
      .finally(() => setIsLoadingNearby(false));
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.wordmark}>2fit</Text>
          <Text style={styles.greeting}>Γεια σου, {user?.name ?? ''}</Text>
        </View>
        <Pressable onPress={logout} hitSlop={8}>
          <Text style={styles.logout}>Αποσύνδεση</Text>
        </Pressable>
      </View>

      <SearchBar editable={false} onPress={() => navigation.navigate('Search')} />

      {categories.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => String(item.id)}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesRow}
          renderItem={({ item }) => (
            <CategoryChip
              label={item.name}
              onPress={() => navigation.navigate('Search', { initialCategory: item.slug })}
            />
          )}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Κοντά σου</Text>

      {isLoadingNearby ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : nearby.length === 0 ? (
        <Text style={styles.emptyMessage}>Δεν βρέθηκαν αποτελέσματα κοντά σου.</Text>
      ) : (
        nearby.map((place) => <PlaceCard key={`${place.type}-${place.id}`} place={place} />)
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  wordmark: {
    ...typography.subheading,
    color: colors.primary,
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logout: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  categoriesList: {
    marginTop: spacing.lg,
  },
  categoriesRow: {
    paddingRight: spacing.xl,
  },
  sectionTitle: {
    ...typography.subheading,
    marginTop: spacing.xl,
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
