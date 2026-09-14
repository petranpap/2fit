// Shared helpers for rendering/composing fitness-class and booking schedules.

// Laravel returns time columns as "HH:MM:SS" — the UI only ever shows "HH:MM".
export function formatTime(time) {
  return time ? time.slice(0, 5) : null;
}

// Sunday-first, matching JS's Date#getDay() (0 = Sunday) — used to index by
// getDay() directly. Calendar/weekday-header rendering uses a Monday-first
// ISO_WEEK_DAYS view instead (see below).
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Monday-first, for anything that lays out a week left-to-right the way a
// Greek/European calendar reads (weekday headers, month grids).
export const ISO_WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function dayLabel(dayOfWeek, t) {
  return dayOfWeek ? t(`days.${dayOfWeek}`) : null;
}

// "Δευ, Τετ, Παρ" — a class's set of recurring weekdays, in calendar order
// (not creation order), short form.
export function daysLabel(daysOfWeek, t) {
  if (!daysOfWeek?.length) return null;

  return ISO_WEEK_DAYS.filter((day) => daysOfWeek.includes(day))
    .map((day) => t(`days.${day}Short`))
    .join(', ');
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// "YYYY-MM-DD" from a date's *local* calendar fields — Date#toISOString()
// converts to UTC first, which silently shifts the date backward by a day
// for anyone east of UTC (e.g. Cyprus, UTC+3) whenever it runs before
// 03:00 local time. The backend only ever needs the calendar date the user
// actually pointed at, not a UTC instant.
export function toLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDayEntry(date, t) {
  const today = startOfToday();
  const isToday = date.getTime() === today.getTime();

  return {
    date,
    isoDate: toLocalIsoDate(date),
    label: isToday ? t('booking.today') : t(`days.${DAY_KEYS[date.getDay()]}Short`),
    dayNumber: date.getDate(),
  };
}

// Next 7 calendar days (today first) — kept for anywhere a short strip is
// enough; the full "Book Now" flow now uses CalendarPicker instead.
export function upcomingDays(t, count = 7) {
  const today = startOfToday();

  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return toDayEntry(date, t);
  });
}

// For booking a specific recurring class: the next upcoming date for each of
// the class's available weekdays (one entry per weekday, soonest first) —
// so "book HIIT Training" (Mon/Wed/Fri) resolves to a concrete date instead
// of staying ambiguous about which occurrence.
export function upcomingOccurrencesForDays(daysOfWeek, t, windowDays = 14) {
  if (!daysOfWeek?.length) return [];

  const today = startOfToday();
  const seenWeekdays = new Set();
  const occurrences = [];

  for (let offset = 0; offset < windowDays && seenWeekdays.size < daysOfWeek.length; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const weekday = DAY_KEYS[date.getDay()];

    if (daysOfWeek.includes(weekday) && !seenWeekdays.has(weekday)) {
      seenWeekdays.add(weekday);
      occurrences.push(toDayEntry(date, t));
    }
  }

  return occurrences;
}

export const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
