import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { ISO_WEEK_DAYS } from '../utils/schedule';

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

function startOfDay(date) {
  const clean = new Date(date);
  clean.setHours(0, 0, 0, 0);
  return clean;
}

function isSameDay(a, b) {
  return Boolean(a) && Boolean(b) && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// JS Date#getDay() is Sunday-first (0-6) — the calendar reads Monday-first.
function mondayFirstWeekday(date) {
  return (date.getDay() + 6) % 7;
}

// A self-contained month-grid date picker — not a native module, since
// @react-native-community/datetimepicker has no web renderer (see git log
// for the sprint 6 booking flow) and this needs to work identically in the
// Expo Go app and the web preview.
export default function CalendarPicker({ value, onChange, minDate }) {
  const { t } = useLocale();
  const floor = startOfDay(minDate ?? new Date());
  const today = startOfDay(new Date());

  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ?? floor;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const isEarliestMonth = viewMonth.getFullYear() === floor.getFullYear() && viewMonth.getMonth() === floor.getMonth();
  const firstWeekday = mondayFirstWeekday(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1));
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1)),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          disabled={isEarliestMonth}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('booking.calendarPrevMonth')}
        >
          <Ionicons name="chevron-back" size={20} color={isEarliestMonth ? colors.border : colors.primary} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {t(`months.${MONTH_KEYS[viewMonth.getMonth()]}`)} {viewMonth.getFullYear()}
        </Text>
        <Pressable
          onPress={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('booking.calendarNextMonth')}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {ISO_WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekdayLabel}>
            {t(`days.${day}Short`)}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`blank-${index}`} style={styles.cell} />;
          }

          const disabled = date < floor;
          const selected = isSameDay(date, value);
          const isToday = isSameDay(date, today);

          return (
            <Pressable
              key={date.toISOString()}
              style={styles.cell}
              disabled={disabled}
              onPress={() => onChange(date)}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
            >
              <View style={[styles.dayCircle, selected && styles.dayCircleSelected]}>
                <Text
                  style={[
                    styles.dayNumber,
                    disabled && styles.dayNumberDisabled,
                    isToday && !selected && styles.dayNumberToday,
                    selected && styles.dayNumberSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthLabel: {
    ...typography.bodyStrong,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    ...typography.caption,
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    ...typography.body,
    fontSize: 14,
  },
  dayNumberDisabled: {
    color: colors.border,
  },
  dayNumberToday: {
    color: colors.primary,
    fontFamily: typography.bodyStrong.fontFamily,
  },
  dayNumberSelected: {
    color: colors.surface,
    fontFamily: typography.bodyStrong.fontFamily,
  },
});
