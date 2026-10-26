const WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Turns the { monday: { is_open, opens_at, closes_at }, ... } shape from the
 * API into a two-line quick-fact: a day range ("Mon - Sat") plus the shared
 * hours ("07:00 - 22:00"), when every open day shares the same hours and
 * forms one contiguous run. Irregular schedules fall back to today's status
 * instead of a misleading range. Returns null when there's nothing open —
 * the quick-facts row skips the tile rather than showing an empty one.
 */
export function summarizeOpeningHours(openingHours, t) {
  if (!openingHours) return null;

  const openDays = WEEK.filter((day) => openingHours[day]?.is_open);
  if (openDays.length === 0) return null;

  const hoursKey = (day) => `${openingHours[day].opens_at}-${openingHours[day].closes_at}`;
  const sameHoursEveryDay = openDays.every((day) => hoursKey(day) === hoursKey(openDays[0]));

  if (sameHoursEveryDay) {
    const indexes = openDays.map((day) => WEEK.indexOf(day));
    const isContiguous = indexes.every((value, i) => i === 0 || value === indexes[i - 1] + 1);

    if (isContiguous) {
      const first = t(`days.${openDays[0]}Short`);
      const last = t(`days.${openDays[openDays.length - 1]}Short`);
      const { opens_at: opensAt, closes_at: closesAt } = openingHours[openDays[0]];

      return {
        primary: first === last ? first : `${first} - ${last}`,
        secondary: `${opensAt} - ${closesAt}`,
      };
    }
  }

  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, matching WEEK
  const today = WEEK[todayIndex];
  const todayHours = openingHours[today];

  if (todayHours?.is_open) {
    return {
      primary: t('placeDetail.todayLabel'),
      secondary: `${todayHours.opens_at} - ${todayHours.closes_at}`,
    };
  }

  return {
    primary: t('placeDetail.closedTodayLabel'),
    secondary: '',
  };
}
