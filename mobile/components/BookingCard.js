import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const STATUS_KEYS = {
  pending: 'booking.statusPending',
  confirmed: 'booking.statusConfirmed',
  cancelled: 'booking.statusCancelled',
};

const STATUS_COLORS = {
  pending: colors.secondary,
  confirmed: colors.primary,
  cancelled: colors.textSecondary,
};

function formatScheduledAt(scheduledAt, locale) {
  if (!scheduledAt) return null;

  const date = new Date(scheduledAt);
  const localeTag = locale === 'el' ? 'el-GR' : 'en-US';

  const datePart = date.toLocaleDateString(localeTag, { day: 'numeric', month: 'short' });
  const timePart = date.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' });

  return `${datePart} · ${timePart}`;
}

export default function BookingCard({ booking, onCancel, isCancelling }) {
  const { t, locale } = useLocale();
  const title = booking.fitness_class?.name || t('myBookings.generalBooking');
  const schedule = formatScheduledAt(booking.scheduled_at, locale);
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <View style={[styles.card, shadows.small]}>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLORS[booking.status]}1F` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[booking.status] }]}>
              {t(STATUS_KEYS[booking.status])}
            </Text>
          </View>
        </View>
        {booking.bookable ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {booking.bookable.name}
          </Text>
        ) : null}
        {schedule ? <Text style={styles.schedule}>{schedule}</Text> : null}
      </View>

      {canCancel ? (
        <Pressable
          onPress={onCancel}
          disabled={isCancelling}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
        >
          <Text style={styles.cancelButtonLabel}>
            {isCancelling ? t('myBookings.cancelling') : t('myBookings.cancelAction')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  body: {
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    flexShrink: 1,
  },
  statusPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    ...typography.caption,
    fontFamily: typography.bodyStrong.fontFamily,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  schedule: {
    ...typography.caption,
    marginTop: 2,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonLabel: {
    ...typography.caption,
    color: colors.danger,
    fontFamily: typography.bodyStrong.fontFamily,
  },
});
