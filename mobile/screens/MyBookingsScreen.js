import { useCallback, useMemo, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelBooking, fetchMyBookings } from '../api/bookings';
import BookingCard from '../components/BookingCard';
import CalendarPicker from '../components/CalendarPicker';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';
import { confirmAsync, notify } from '../utils/alerts';
import { cancelBookingReminder, scheduleRemindersForBookings } from '../utils/notifications';
import { toLocalIsoDate } from '../utils/schedule';

function bookingIsoDate(booking) {
  return booking.scheduled_at ? booking.scheduled_at.slice(0, 10) : null;
}

function formatSelectedDate(date, locale) {
  return date.toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function MyBookingsScreen() {
  const { t, locale } = useLocale();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const load = useCallback(() => {
    let isCancelled = false;

    fetchMyBookings()
      .then(({ data }) => {
        if (!isCancelled) {
          setBookings(data);
          // Fire-and-forget — a cold app start has no memory of what was
          // already scheduled, so just redo it every time the list loads.
          scheduleRemindersForBookings(data, t);
        }
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
  }, [t]);

  // Re-fetch every time the screen regains focus — a booking made or
  // cancelled elsewhere should show up here without a manual refresh.
  useFocusEffect(load);

  // Which calendar days get a dot — every date that has at least one
  // booking on it, active or not (a cancelled booking still marks the day;
  // its card just won't offer a Cancel button).
  const markedDates = useMemo(() => new Set(bookings.map(bookingIsoDate).filter(Boolean)), [bookings]);

  const selectedIsoDate = toLocalIsoDate(selectedDate);
  const bookingsOnSelectedDate = useMemo(
    () => bookings.filter((booking) => bookingIsoDate(booking) === selectedIsoDate),
    [bookings, selectedIsoDate]
  );

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
      await cancelBookingReminder(booking.id);
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
      ) : (
        <FlatList
          data={bookingsOnSelectedDate}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <View style={styles.calendarWrap}>
              <CalendarPicker
                value={selectedDate}
                onChange={setSelectedDate}
                disablePastDates={false}
                markedDates={markedDates}
              />
              <Text style={styles.selectedDateLabel}>{formatSelectedDate(selectedDate, locale)}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <BookingCard booking={item} onCancel={() => handleCancel(item)} isCancelling={cancellingId === item.id} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {bookings.length === 0 ? t('myBookings.emptyTitle') : t('myBookings.emptyForDay')}
              </Text>
              {bookings.length === 0 ? <Text style={styles.emptySubtitle}>{t('myBookings.emptySubtitle')}</Text> : null}
            </View>
          }
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
  calendarWrap: {
    marginBottom: spacing.lg,
  },
  selectedDateLabel: {
    ...typography.subheading,
    fontSize: 16,
    marginTop: spacing.lg,
    textTransform: 'capitalize',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
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
