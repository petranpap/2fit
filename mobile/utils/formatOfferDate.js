// Display the calendar expiry date consistently in Cyprus/UK day-month-year format.
// ISO dates from Laravel are parsed directly to avoid timezone-related day shifts.
export function formatOfferDate(value) {
  if (!value) return '';

  const isoDate = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
