import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// How long before a booking's scheduled time to remind the user.
const REMINDER_HOURS_BEFORE = 3;

// expo-notifications has no scheduling backend on web at all — its web
// "module" is an empty stub (see node_modules/expo-notifications/src/
// NotificationScheduler.ts, used whenever there's no .native.ts override).
// Calling scheduleNotificationAsync there doesn't gracefully no-op, so every
// function here bails out early on web instead of calling into it.
const isSupported = Platform.OS !== 'web';

if (isSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

let hasCheckedPermission = false;
let permissionGranted = false;

async function ensurePermission() {
  if (!isSupported) return false;
  if (hasCheckedPermission) return permissionGranted;

  try {
    const current = await Notifications.getPermissionsAsync();
    const result = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();

    permissionGranted = result.status === 'granted';
  } catch (err) {
    console.warn('Notification permission request failed', err);
    permissionGranted = false;
  }

  hasCheckedPermission = true;
  return permissionGranted;
}

function reminderIdentifier(bookingId) {
  return `booking-${bookingId}`;
}

// Schedules a local "your class is coming up" reminder ~3 hours before a
// single booking's scheduled time. Booking a slot that's already less than
// 3 hours away, or one with no scheduled_at, simply gets no reminder — a
// notification about something already happening isn't useful. Re-scheduling
// with the same identifier (one per booking) safely replaces any previous
// reminder for it rather than stacking duplicates.
export async function scheduleBookingReminder(booking, t) {
  if (!isSupported || !booking?.scheduled_at || booking.status === 'cancelled') return;

  const scheduledAt = new Date(booking.scheduled_at);
  const triggerAt = new Date(scheduledAt.getTime() - REMINDER_HOURS_BEFORE * 60 * 60 * 1000);

  if (triggerAt <= new Date()) return;

  const granted = await ensurePermission();
  if (!granted) return;

  const name = booking.fitness_class?.name || t('notifications.genericBookingName');
  const placeName = booking.bookable?.name;
  const body = placeName
    ? t('notifications.reminderBody', { name, hours: REMINDER_HOURS_BEFORE, place: placeName })
    : t('notifications.reminderBodyNoPlace', { name, hours: REMINDER_HOURS_BEFORE });

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: reminderIdentifier(booking.id),
      content: { title: t('notifications.reminderTitle'), body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerAt },
    });
  } catch (err) {
    console.warn('Failed to schedule booking reminder', err);
  }
}

export async function cancelBookingReminder(bookingId) {
  if (!isSupported) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(reminderIdentifier(bookingId));
  } catch {
    // Nothing was scheduled for this booking, or it already fired — either
    // way there's nothing left to cancel.
  }
}

// Re-schedules reminders for a freshly-fetched list of bookings — call this
// whenever My Bookings loads. The app has no persistent record of what's
// already scheduled between cold starts, and scheduling is a safe, cheap
// overwrite either way (same identifier per booking), so just redo it all.
export async function scheduleRemindersForBookings(bookings, t) {
  if (!isSupported) return;
  await Promise.all(bookings.map((booking) => scheduleBookingReminder(booking, t)));
}
