// Shared helpers for rendering a fitness class's schedule as read-only text.

// Laravel returns time columns as "HH:MM:SS" — the UI only ever shows "HH:MM".
export function formatTime(time) {
  return time ? time.slice(0, 5) : null;
}

// Monday-first, for anything that lays out a week left-to-right the way a
// Greek/European calendar reads.
export const ISO_WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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

// "2026-09-16" -> local midnight Date — deliberately not `new Date(iso)`,
// which parses a bare date string as UTC midnight and can display as the
// previous day for anyone east of UTC (e.g. Cyprus, UTC+3).
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
