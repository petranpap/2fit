import { useCallback, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelBooking, fetchMyBookings } from '../api/bookings';
import BookingCard from '../components/BookingCard';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';
import { confirmAsync, notify } from '../utils/alerts';

export default function MyBookingsScreen() {
  const { t } = useLocale();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(() => {
    let isCancelled = false;

    fetchMyBookings()
      .then(({ data }) => {
        if (!isCancelled) setBookings(data);
      })
      .catch(() => {
        if (!isCancelled) setBookings([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Re-fetch every time the screen regains focus — a booking made or
  // cancelled elsewhere should show up here without a manual refresh.
  useFocusEffect(load);

  const handleCancel = async (booking) => {
    const confirmed = await confirmAsync({
      title: t('myBookings.cancelConfirmTitle'),
      message: t('myBookings.cancelConfirmMessage'),
      confirmLabel: t('myBookings.cancelConfirmYes'),
      cancelLabel: t('myBookings.cancelConfirmNo'),
    });

    if (!confirmed) return;

    setCancellingId(booking.id);
    try {
      const { data } = await cancelBooking(booking.id);
      setBookings((current) => current.map((item) => (item.id === booking.id ? data : item)));
    } catch (err) {
      console.error('cancelBooking failed', err);
      notify(t('myBookings.cancelError'));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>{t('myBookings.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('myBookings.emptySubtitle')}</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <BookingCard booking={item} onCancel={() => handleCancel(item)} isCancelling={cancellingId === item.id} />
          )}
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
