import { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPlace } from '../api/places';
import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import ClassListItem from '../components/ClassListItem';
import FacilityTile from '../components/FacilityTile';
import Gallery from '../components/Gallery';
import MenuListItem from '../components/MenuListItem';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function PlaceDetailScreen({ route, navigation }) {
  const { type, id, distanceKm } = route.params;
  const { t } = useLocale();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlace(type, id)
      .then(({ data }) => setPlace(data))
      .catch(() => setError(t('placeDetail.loadError')))
      .finally(() => setIsLoading(false));
  }, [type, id]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: place?.name ?? '',
      headerRight: () =>
        place ? (
          <Pressable
            onPress={() =>
              Share.share({ message: t('placeDetail.shareMessage', { name: place.name }) })
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('placeDetail.shareAction')}
          >
            <Ionicons name="share-outline" size={22} color={colors.primary} />
          </Pressable>
        ) : null,
    });
  }, [navigation, place, t]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !place) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <Text style={styles.message}>{error ?? t('placeDetail.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const imageUrl = place.cover_image_url ?? place.photo_url ?? place.logo_url;
  const hasContact = place.phone || place.email || place.website;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView>
        <Gallery images={imageUrl ? [imageUrl] : []} />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{place.name}</Text>
            {place.is_verified ? (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.typeBadge}>{t(`placeTypes.${place.type}`)}</Text>
            {distanceKm != null ? <Text style={styles.metaText}>· {distanceKm.toFixed(1)} km</Text> : null}
            {place.type === 'trainer' && place.hourly_rate ? (
              <Text style={styles.metaText}>· {t('placeDetail.hourlyRate', { rate: place.hourly_rate })}</Text>
            ) : null}
          </View>

          {place.address ? <Text style={styles.address}>{place.address}</Text> : null}

          {place.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.aboutSection')}</Text>
              <Text style={styles.body}>{place.description}</Text>
            </View>
          ) : null}

          {place.categories?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.categoriesSection')}</Text>
              <View style={styles.categoryWrap}>
                {place.categories.map((category) => (
                  <CategoryChip key={category.id} label={category.name} />
                ))}
              </View>
            </View>
          ) : null}

          {place.facilities?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.facilitiesSection')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {place.facilities.map((facility) => (
                  <FacilityTile key={facility.id} facility={facility} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {place.fitness_classes?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.classesSection')}</Text>
              <View>
                {place.fitness_classes.map((fitnessClass) => (
                  <ClassListItem
                    key={fitnessClass.id}
                    fitnessClass={fitnessClass}
                    onBook={() =>
                      navigation.navigate('BookingRequest', {
                        bookableType: place.type,
                        bookableId: place.id,
                        placeName: place.name,
                        fitnessClassId: fitnessClass.id,
                        className: fitnessClass.name,
                        classDaysOfWeek: fitnessClass.days_of_week,
                        classStartsAt: fitnessClass.starts_at,
                      })
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('placeDetail.reviewsSection')}</Text>
            {place.reviews_count === 0 ? (
              <Text style={styles.body}>{t('placeDetail.noReviewsYet')}</Text>
            ) : (
              <View style={styles.metaRow}>
                <Ionicons name="star" size={16} color={colors.secondary} />
                <Text style={styles.body}>
                  {place.rating_avg} ·{' '}
                  {t(place.reviews_count === 1 ? 'placeDetail.reviewsOne' : 'placeDetail.reviews', {
                    count: place.reviews_count,
                  })}
                </Text>
              </View>
            )}
          </View>

          {hasContact ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('placeDetail.contactSection')}</Text>
              {place.phone ? (
                <MenuListItem
                  icon="call-outline"
                  label={place.phone}
                  showChevron={false}
                  onPress={() => Linking.openURL(`tel:${place.phone}`)}
                />
              ) : null}
              {place.email ? (
                <MenuListItem
                  icon="mail-outline"
                  label={place.email}
                  showChevron={false}
                  onPress={() => Linking.openURL(`mailto:${place.email}`)}
                />
              ) : null}
              {place.website ? (
                <MenuListItem
                  icon="globe-outline"
                  label={place.website}
                  showChevron={false}
                  onPress={() => Linking.openURL(place.website)}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t('placeDetail.bookNowAction')}
          onPress={() =>
            navigation.navigate('BookingRequest', {
              bookableType: place.type,
              bookableId: place.id,
              placeName: place.name,
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.heading,
    fontSize: 22,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  typeBadge: {
    ...typography.caption,
    color: colors.primary,
  },
  metaText: {
    ...typography.caption,
  },
  address: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.subheading,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
