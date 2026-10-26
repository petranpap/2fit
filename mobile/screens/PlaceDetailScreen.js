import { useCallback, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toggleFavorite } from '../api/favorites';
import { fetchPlace } from '../api/places';
import { fetchReviews } from '../api/reviews';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';
import { getTypeIcon } from '../utils/categoryIcons';
import { getFacilityIcon } from '../utils/facilityIcons';
import { openDirections } from '../utils/location';
import { summarizeOpeningHours } from '../utils/openingHours';
import { scheduleLabel } from '../utils/schedule';

const IMAGE_HEIGHT = 280;

export default function PlaceDetailScreen({ route, navigation }) {
  const { type, id, distanceKm } = route.params;
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Refetch on every focus, not just on mount — returning here after
  // writing a review (or the Facilities/Classes data changes elsewhere)
  // should show the latest state.
  useFocusEffect(
    useCallback(() => {
      let isCancelled = false;

      fetchPlace(type, id)
        .then(({ data }) => {
          if (!isCancelled) {
            setPlace(data);
            setIsFavorited(Boolean(data.is_favorited));
          }
        })
        .catch(() => {
          if (!isCancelled) setError(t('placeDetail.loadError'));
        })
        .finally(() => {
          if (!isCancelled) setIsLoading(false);
        });

      fetchReviews(type, id)
        .then(({ data }) => {
          if (!isCancelled) setReviews(data);
        })
        .catch(() => {
          if (!isCancelled) setReviews([]);
        });

      return () => {
        isCancelled = true;
      };
    }, [type, id, t])
  );

  const myReview = reviews.find((review) => review.user.id === user.id);

  const handleWriteReview = () => {
    navigation.navigate('WriteReview', { type, id, placeName: place?.name });
  };

  const handleShare = () => {
    if (!place) return;
    Share.share({ message: t('placeDetail.shareMessage', { name: place.name }) });
  };

  const handleDirections = () => {
    if (!place?.latitude || !place?.longitude) return;
    openDirections(place.latitude, place.longitude);
  };

  // Optimistic: flip the heart immediately, revert only if the call fails —
  // a toggle should feel instant, not wait on a round trip.
  const handleFavorite = () => {
    if (!place) return;

    const next = !isFavorited;
    setIsFavorited(next);

    toggleFavorite(place.type, place.id).catch(() => {
      setIsFavorited(!next);
      Alert.alert(t('placeDetail.loadError'));
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'bottom']}>
        <ActivityIndicator color="#FFD400" />
      </SafeAreaView>
    );
  }

  if (error || !place) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'bottom']}>
        <Text style={styles.message}>{error ?? t('placeDetail.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const isTrainer = place.type === 'trainer';
  const imageUrl = place.cover_image_url ?? place.photo_url ?? place.logo_url;
  const hasContact = place.phone || place.email || place.website;
  const hours = summarizeOpeningHours(place.opening_hours, t);

  const favoriteButton = (
    <Pressable
      onPress={handleFavorite}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('placeDetail.favoriteA11y')}
      style={({ pressed }) => [styles.overlayButton, pressed && styles.overlayButtonPressed]}
    >
      <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={20} color={isFavorited ? '#FFD400' : '#FFFFFF'} />
    </Pressable>
  );

  const shareButton = (
    <Pressable
      onPress={handleShare}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('placeDetail.shareAction')}
      style={({ pressed }) => [styles.overlayButton, pressed && styles.overlayButtonPressed]}
    >
      <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
    </Pressable>
  );

  // Only tiles backed by real data ever render — no fabricated price or
  // equipment rating when the model has nothing to say.
  const quickFacts = [
    distanceKm != null && {
      icon: 'navigate-outline',
      primary: `${distanceKm.toFixed(1)} km`,
      secondary: t('placeDetail.distanceLabel'),
    },
    place.hourly_rate != null && {
      icon: 'pricetag-outline',
      primary: t('placeDetail.hourlyRate', { rate: place.hourly_rate }),
      secondary: t('placeDetail.priceLabel'),
    },
    hours && {
      icon: 'time-outline',
      primary: hours.primary,
      secondary: hours.secondary,
    },
    {
      icon: getTypeIcon(place.type),
      primary: t(`placeTypes.${place.type}`),
      secondary: t('placeDetail.typeLabel'),
    },
  ].filter(Boolean);

  return (
    <View style={styles.screen}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isTrainer ? (
          <SafeAreaView edges={['top']} style={styles.trainerTopBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('placeDetail.backA11y')}
              style={({ pressed }) => [styles.trainerTopButton, pressed && styles.overlayButtonPressed]}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>

            <View style={styles.overlayRight}>
              <Pressable
                onPress={handleFavorite}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('placeDetail.favoriteA11y')}
                style={({ pressed }) => [styles.trainerTopButton, pressed && styles.overlayButtonPressed]}
              >
                <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorited ? '#FFD400' : '#FFFFFF'}
                />
              </Pressable>

              <Pressable
                onPress={handleShare}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('placeDetail.shareAction')}
                style={({ pressed }) => [styles.trainerTopButton, pressed && styles.overlayButtonPressed]}
              >
                <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </SafeAreaView>
        ) : (
          <View style={styles.imageWrap}>
            {imageUrl ? (
              <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Ionicons name="image-outline" size={40} color="#FFD400" />
              </View>
            )}

            <SafeAreaView edges={['top']} style={styles.overlayRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('placeDetail.backA11y')}
                style={({ pressed }) => [styles.overlayButton, pressed && styles.overlayButtonPressed]}
              >
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </Pressable>

              <View style={styles.overlayRight}>
                {favoriteButton}
                {shareButton}
              </View>
            </SafeAreaView>
          </View>
        )}

        <View style={styles.content}>
          {isTrainer ? (
            <View style={styles.trainerHeaderRow}>
              {imageUrl ? (
                <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={30} color="#FFD400" />
                </View>
              )}

              <View style={styles.trainerHeaderInfo}>
                <View style={styles.nameWrap}>
                  <Text style={styles.name} numberOfLines={2}>
                    {place.name}
                  </Text>
                  {place.is_verified ? <Ionicons name="checkmark-circle" size={16} color="#FFD400" /> : null}
                </View>

                <Text style={styles.trainerRole}>
                  {t(`placeTypes.${place.type}`)}
                  {place.hourly_rate != null ? ` · ${t('placeDetail.hourlyRate', { rate: place.hourly_rate })}` : ''}
                </Text>

                {place.reviews_count > 0 ? (
                  <View style={styles.trainerRatingRow}>
                    <Ionicons name="star" size={13} color="#FFD400" />
                    <Text style={styles.trainerRatingText}>
                      {place.rating_avg} ({place.reviews_count})
                    </Text>
                  </View>
                ) : null}

                {place.address ? (
                  <Pressable
                    onPress={handleDirections}
                    style={({ pressed }) => [styles.metaRow, pressed && styles.pressed]}
                  >
                    <Ionicons name="location-outline" size={13} color="#FFD400" />
                    <Text style={styles.trainerLocationText} numberOfLines={1}>
                      {place.address}
                    </Text>
                    <Text style={styles.directionsLink}>{t('placeDetail.directionsAction')}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.titleRow}>
                <View style={styles.nameWrap}>
                  <Text style={styles.name} numberOfLines={2}>
                    {place.name}
                  </Text>
                  {place.is_verified ? <Ionicons name="checkmark-circle" size={18} color="#FFD400" /> : null}
                </View>

                {place.reviews_count > 0 ? (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={13} color="#111111" />
                    <Text style={styles.ratingText}>{place.rating_avg}</Text>
                    <Text style={styles.ratingCount}>({place.reviews_count})</Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                onPress={place.address ? handleDirections : undefined}
                style={({ pressed }) => [styles.metaRow, pressed && place.address && styles.pressed]}
              >
                <Ionicons name="location-outline" size={15} color="#FFD400" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {place.address ?? t(`placeTypes.${place.type}`)}
                </Text>
                {place.address ? <Text style={styles.directionsLink}>{t('placeDetail.directionsAction')}</Text> : null}
              </Pressable>

              {quickFacts.length > 0 ? (
                <View style={styles.factsCard}>
                  {quickFacts.map((fact, index) => (
                    <View key={fact.secondary} style={[styles.factColumn, index > 0 && styles.factColumnDivider]}>
                      <Ionicons name={fact.icon} size={18} color="#FFD400" style={styles.factIcon} />
                      <Text style={styles.factPrimary} numberOfLines={1}>
                        {fact.primary}
                      </Text>
                      <Text style={styles.factSecondary} numberOfLines={1}>
                        {fact.secondary}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          )}

          {place.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.aboutSection')}</Text>
              <Text style={styles.body}>{place.description}</Text>
            </View>
          ) : null}

          {place.categories?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t(isTrainer ? 'placeDetail.specialtiesSection' : 'placeDetail.categoriesSection')}
              </Text>
              <View style={styles.chipWrap}>
                {place.categories.map((category) => (
                  <View key={category.id} style={styles.chip}>
                    <Text style={styles.chipText}>{category.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {place.facilities?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.facilitiesSection')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {place.facilities.map((facility) => (
                  <View key={facility.id} style={styles.facilityTile}>
                    <View style={styles.facilityIconCircle}>
                      <Ionicons name={getFacilityIcon(facility.slug)} size={20} color="#FFD400" />
                    </View>
                    <Text style={styles.facilityLabel} numberOfLines={2}>
                      {facility.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {place.fitness_classes?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.popularClassesSection')}</Text>
              <View>
                {place.fitness_classes.map((fitnessClass) => {
                  const schedule = scheduleLabel(fitnessClass, t, locale);
                  const spots = fitnessClass.spots_available;
                  const isFull = spots === 0;
                  const spotsLabel =
                    spots == null
                      ? null
                      : isFull
                        ? t('placeDetail.classFull')
                        : t(spots === 1 ? 'placeDetail.spotsAvailableOne' : 'placeDetail.spotsAvailable', {
                            count: spots,
                          });

                  return (
                    <View key={fitnessClass.id} style={styles.classRow}>
                      <View style={styles.classIconCircle}>
                        <Ionicons name="barbell-outline" size={18} color="#FFD400" />
                      </View>

                      <View style={styles.classInfo}>
                        <Text style={styles.className} numberOfLines={1}>
                          {fitnessClass.name}
                        </Text>
                        {schedule ? (
                          <Text style={styles.classSchedule} numberOfLines={1}>
                            {schedule}
                          </Text>
                        ) : null}
                        {spotsLabel ? (
                          <Text style={[styles.classSpots, isFull && styles.classSpotsFull]}>{spotsLabel}</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.sectionTitle}>{t('placeDetail.reviewsSection')}</Text>
              <Pressable onPress={handleWriteReview} hitSlop={8}>
                <Text style={styles.writeReviewLink}>
                  {myReview ? t('reviews.editAction') : t('reviews.writeAction')}
                </Text>
              </Pressable>
            </View>

            {place.reviews_count > 0 ? (
              <View style={[styles.metaRow, styles.reviewsSummaryRow]}>
                <Ionicons name="star" size={16} color="#FFD400" />
                <Text style={styles.body}>
                  {place.rating_avg} ·{' '}
                  {t(place.reviews_count === 1 ? 'placeDetail.reviewsOne' : 'placeDetail.reviews', {
                    count: place.reviews_count,
                  })}
                </Text>
              </View>
            ) : (
              <Text style={styles.body}>{t('placeDetail.noReviewsYet')}</Text>
            )}

            {reviews.slice(0, 5).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>

          {hasContact ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.contactSection')}</Text>
              {place.phone ? (
                <Pressable
                  onPress={() => Linking.openURL(`tel:${place.phone}`)}
                  style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
                >
                  <Ionicons name="call-outline" size={18} color="#FFD400" />
                  <Text style={styles.contactText}>{place.phone}</Text>
                </Pressable>
              ) : null}
              {place.email ? (
                <Pressable
                  onPress={() => Linking.openURL(`mailto:${place.email}`)}
                  style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
                >
                  <Ionicons name="mail-outline" size={18} color="#FFD400" />
                  <Text style={styles.contactText}>{place.email}</Text>
                </Pressable>
              ) : null}
              {place.website ? (
                <Pressable
                  onPress={() => Linking.openURL(place.website)}
                  style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
                >
                  <Ionicons name="globe-outline" size={18} color="#FFD400" />
                  <Text style={styles.contactText}>{place.website}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#111111',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#CFCFCF',
  },

  imageWrap: {
    height: IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  overlayRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  overlayRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  overlayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(17, 17, 17, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayButtonPressed: {
    opacity: 0.7,
  },

  trainerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  trainerTopButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: spacing.xl,
  },

  trainerHeaderRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#FFD400',
  },
  avatarPlaceholder: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trainerRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D8D8D8',
    marginTop: 2,
  },
  trainerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  trainerRatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trainerLocationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
    flexShrink: 1,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  nameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFD400',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
  },
  ratingCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3A3A',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D8D8D8',
    flexShrink: 1,
  },
  directionsLink: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD400',
    textDecorationLine: 'underline',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: '#C7C7C7',
  },

  factsCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 18,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  factColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  factColumnDivider: {
    borderLeftWidth: 1,
    borderLeftColor: '#2E2E2E',
  },
  factIcon: {
    marginBottom: 6,
  },
  factPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  factSecondary: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9A9A9A',
    marginTop: 2,
  },

  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  writeReviewLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD400',
    marginBottom: spacing.sm,
  },
  reviewsSummaryRow: {
    marginBottom: spacing.md,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD400',
  },

  facilityTile: {
    alignItems: 'center',
    width: 76,
    marginRight: spacing.md,
  },
  facilityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  facilityLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D8D8D8',
    textAlign: 'center',
  },

  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  classIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  classSchedule: {
    fontSize: 12,
    fontWeight: '500',
    color: '#B8B8B8',
    marginTop: 2,
  },
  classSpots: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD400',
    marginTop: 2,
  },
  classSpotsFull: {
    color: '#FF6B6B',
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E2E',
  },
  contactText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.75,
  },

  scrollContent: {
    paddingBottom: spacing.xl,
  },
});
