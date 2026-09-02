// Shared helpers for rendering/composing fitness-class and booking schedules.

// Laravel returns time columns as "HH:MM:SS" — the UI only ever shows "HH:MM".
export function formatTime(time) {
  return time ? time.slice(0, 5) : null;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function dayLabel(dayOfWeek, t) {
  return dayOfWeek ? t(`days.${dayOfWeek}`) : null;
}

// Next 7 calendar days (today first), used by the generic "Book Now" flow to
// let the user pick a date without a native picker (no web support — see
// FacilityTile/BookingRequestScreen for context).
export function upcomingDays(t, count = 7) {
  const today = new Date();

  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    return {
      date,
      isoDate: date.toISOString().slice(0, 10),
      label: offset === 0 ? t('booking.today') : t(`days.${DAY_KEYS[date.getDay()]}Short`),
      dayNumber: date.getDate(),
    };
  });
}

export const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
