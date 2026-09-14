import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { daysLabel, formatTime } from '../utils/schedule';

export default function ClassListItem({ fitnessClass, onBook }) {
  const { t } = useLocale();
  const schedule = [daysLabel(fitnessClass.days_of_week, t), formatTime(fitnessClass.starts_at)]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {fitnessClass.name}
          </Text>
          {fitnessClass.is_popular ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('placeDetail.popularBadge')}</Text>
            </View>
          ) : null}
        </View>
        {schedule ? <Text style={styles.schedule}>{schedule}</Text> : null}
      </View>

      <Pressable
        onPress={onBook}
        style={({ pressed }) => [styles.bookButton, pressed && styles.bookButtonPressed]}
      >
        <Text style={styles.bookButtonLabel}>{t('placeDetail.bookAction')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.bodyStrong,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: colors.secondaryTint,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontFamily: typography.bodyStrong.fontFamily,
  },
  schedule: {
    ...typography.caption,
    marginTop: 2,
  },
  bookButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bookButtonPressed: {
    opacity: 0.7,
  },
  bookButtonLabel: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: typography.bodyStrong.fontFamily,
  },
});
