import { useCallback, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deleteReview, fetchMyReviews } from '../api/reviews';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';

export default function MyReviewsScreen({ navigation }) {
  const { t, locale } = useLocale();

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    fetchMyReviews()
      .then(({ data }) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = (review) => {
    Alert.alert(t('reviews.deleteConfirmTitle'), t('reviews.deleteConfirmMessage'), [
      { text: t('reviews.deleteConfirmNo'), style: 'cancel' },
      {
        text: t('reviews.deleteConfirmYes'),
        style: 'destructive',
        onPress: () => {
          setReviews((current) => current.filter((item) => item.id !== review.id));
          deleteReview(review.id).catch(() => load());
        },
      },
    ]);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {isLoading ? (
        <ActivityIndicator color="#FFD400" style={styles.spinner} />
      ) : reviews.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="star-outline" size={42} color="#111111" />
          </View>
          <Text style={styles.emptyTitle}>{t('reviews.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('reviews.emptySubtitle')}</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                item.reviewable &&
                navigation.navigate('PlaceDetail', { type: item.reviewable.type, id: item.reviewable.id })
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {item.reviewable?.name ?? t('reviews.unknownPlace')}
                </Text>
                <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </Pressable>
              </View>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= item.rating ? 'star' : 'star-outline'}
                    size={14}
                    color="#FFD400"
                  />
                ))}
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              </View>

              {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },
  spinner: {
    marginTop: spacing.xl,
  },
  list: {
    padding: spacing.xl,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2E2E2E',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8A8A',
    marginLeft: 8,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#C7C7C7',
  },

  emptyCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingVertical: 35,
  },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD400',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
    color: '#D0D0D0',
    textAlign: 'center',
  },
});
