import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createBooking } from '../api/bookings';
import Button from '../components/Button';
import CalendarPicker from '../components/CalendarPicker';
import CategoryChip from '../components/CategoryChip';
import TextField from '../components/TextField';
import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { formatTime, TIME_SLOTS, toLocalIsoDate, upcomingOccurrencesForDays } from '../utils/schedule';

export default function BookingRequestScreen({ route, navigation }) {
  const {
    bookableType,
    bookableId,
    placeName,
    fitnessClassId,
    className,
    classDaysOfWeek,
    classStartsAt,
  } = route.params;
  const { t } = useLocale();

  // Every booking needs an explicit date. A class already has a fixed time
  // and a fixed set of weekdays — the user only picks *which* upcoming
  // occurrence of those days they mean. A generic "Book Now" has neither,
  // so it gets a full calendar plus a time-of-day choice.
  const isClassBooking = Boolean(fitnessClassId);
  const occurrences = isClassBooking ? upcomingOccurrencesForDays(classDaysOfWeek, t) : [];

  const [selectedOccurrence, setSelectedOccurrence] = useState(occurrences[0] ?? null);
  const [selectedDate, setSelectedDate] = useState(isClassBooking ? null : new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const handleConfirm = async () => {
    if (isClassBooking && !selectedOccurrence) {
      setError(t('booking.pickDateError'));
      return;
    }

    if (!isClassBooking && (!selectedDate || !selectedTime)) {
      setError(t('booking.pickDateTimeError'));
      return;
    }

    const isoDate = isClassBooking ? selectedOccurrence.isoDate : toLocalIsoDate(selectedDate);
    const time = isClassBooking ? classStartsAt?.slice(0, 5) : selectedTime;

    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await createBooking({
        bookableType,
        bookableId,
        fitnessClassId,
        scheduledAt: time ? `${isoDate} ${time}:00` : undefined,
        notes,
      });
      setBooking(data);
    } catch (err) {
      console.error('createBooking failed', err);
      setError(err.message && err.message !== 'Request failed' ? err.message : t('booking.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
          <Text style={styles.successTitle}>{t('booking.successTitle')}</Text>
          <Text style={styles.successMessage}>{t('booking.successMessage')}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{t('booking.statusPending')}</Text>
          </View>
          <View style={styles.doneButton}>
            <Button label={t('booking.doneAction')} onPress={() => navigation.goBack()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.summaryLabel}>{className ?? placeName}</Text>
        {className ? <Text style={styles.summarySubtitle}>{placeName}</Text> : null}

        {isClassBooking ? (
          <>
            <Text style={styles.sectionTitle}>{t('booking.dateSection')}</Text>
            <View style={styles.chipsWrap}>
              {occurrences.map((occurrence) => (
                <CategoryChip
                  key={occurrence.isoDate}
                  label={`${occurrence.label} ${occurrence.dayNumber}`}
                  selected={selectedOccurrence?.isoDate === occurrence.isoDate}
                  onPress={() => setSelectedOccurrence(occurrence)}
                />
              ))}
            </View>
            {classStartsAt ? (
              <Text style={styles.fixedTime}>{t('booking.classTimeLabel', { time: formatTime(classStartsAt) })}</Text>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{t('booking.dateSection')}</Text>
            <CalendarPicker value={selectedDate} onChange={setSelectedDate} />

            <Text style={styles.sectionTitle}>{t('booking.timeSection')}</Text>
            <View style={styles.chipsWrap}>
              {TIME_SLOTS.map((time) => (
                <CategoryChip
                  key={time}
                  label={time}
                  selected={selectedTime === time}
                  onPress={() => setSelectedTime(time)}
                />
              ))}
            </View>
          </>
        )}

        <TextField
          label={t('booking.notesLabel')}
          placeholder={t('booking.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
          style={styles.notesField}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isSubmitting ? t('booking.confirming') : t('booking.confirmAction')}
          onPress={handleConfirm}
          loading={isSubmitting}
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
  content: {
    padding: spacing.xl,
  },
  summaryLabel: {
    ...typography.heading,
    fontSize: 20,
  },
  summarySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.subheading,
    fontSize: 16,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fixedTime: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  notesField: {
    marginTop: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successTitle: {
    ...typography.heading,
    fontSize: 20,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  successMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  statusPill: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  doneButton: {
    marginTop: spacing['2xl'],
    alignSelf: 'stretch',
  },
});
