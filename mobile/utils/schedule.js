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

// "29 Σεπ" / "Sep 29" — the single date of a one_time session.
export function formatOneTimeDate(isoDate, locale) {
  if (!isoDate) return null;

  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US', { day: 'numeric', month: 'short' });
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

// "2026-09-16" -> local midnight Date — deliberately not `new Date(iso)`,
// which parses a bare date string as UTC midnight and can display as the
// previous day for anyone west of... no, *east* of UTC (see toLocalIsoDate).
export function parseLocalDate(isoDate) {
  if (!isoDate) return null;

  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// "16 Δεκ 2026" / "Dec 16, 2026" — when a bounded recurring class's "repeat
// for N months" window actually ends.
export function formatRecurrenceEndDate(fitnessClass, locale) {
  if (!fitnessClass.recurrence_months) return null;

  const startsOn = parseLocalDate(fitnessClass.starts_on);
  if (!startsOn) return null;

  const end = addMonths(startsOn, fitnessClass.recurrence_months);

  return end.toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// The one line that answers "when does this actually happen": a specific
// date for a one-time session, or "Every Mon, Wed, Fri · 18:00 · ongoing"
// (or "· until 16 Dec 2026" when bounded) for a recurring one — so a
// recurring class reads unambiguously as recurring, not as a one-off list
// of days.
export function scheduleLabel(fitnessClass, t, locale) {
  if (fitnessClass.recurrence_type === 'one_time') {
    return [formatOneTimeDate(fitnessClass.starts_on, locale), formatTime(fitnessClass.starts_at)]
      .filter(Boolean)
      .join(' · ');
  }

  const days = daysLabel(fitnessClass.days_of_week, t);
  const time = formatTime(fitnessClass.starts_at);

  if (!days) return time;

  const everyDays = t('placeDetail.everyDays', { days });
  const bound = fitnessClass.recurrence_months
    ? t('placeDetail.untilDate', { date: formatRecurrenceEndDate(fitnessClass, locale) })
    : t('placeDetail.ongoingLabel');

  return [everyDays, time, bound].filter(Boolean).join(' · ');
}

// For booking a class: the date(s) it can actually be booked on. A one_time
// session has exactly one (its own date, once it's passed there's nothing
// left to book). A recurring class has the next occurrence of each of its
// weekdays, bounded so it never offers a date before the class actually
// started, and never past its "repeat for N months" end date if it has one
// — so "book HIIT Training" (Mon/Wed/Fri) resolves to a concrete date
// instead of staying ambiguous about which occurrence, and a class that
// already ended stops offering occurrences instead of pretending it's still
// ongoing.
export function upcomingOccurrencesForClass(fitnessClass, t, windowDays = 90) {
  const today = startOfToday();

  if (fitnessClass.recurrence_type === 'one_time') {
    const date = parseLocalDate(fitnessClass.starts_on);
    return date && date >= today ? [toDayEntry(date, t)] : [];
  }

  const daysOfWeek = fitnessClass.days_of_week;
  if (!daysOfWeek?.length) return [];

  const startsOn = parseLocalDate(fitnessClass.starts_on) ?? today;
  const floor = startsOn > today ? startsOn : today;
  const endDate = fitnessClass.recurrence_months ? addMonths(startsOn, fitnessClass.recurrence_months) : null;

  const seenWeekdays = new Set();
  const occurrences = [];

  for (let offset = 0; offset < windowDays && seenWeekdays.size < daysOfWeek.length; offset++) {
    const date = new Date(floor);
    date.setDate(floor.getDate() + offset);

    if (endDate && date > endDate) break;

    const weekday = DAY_KEYS[date.getDay()];

    if (daysOfWeek.includes(weekday) && !seenWeekdays.has(weekday)) {
      seenWeekdays.add(weekday);
      occurrences.push(toDayEntry(date, t));
    }
  }

  return occurrences;
}

export const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
