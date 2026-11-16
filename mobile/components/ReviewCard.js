import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';

function formatDate(isoString, locale) {
  const date = new Date(isoString);
  return date.toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReviewCard({ review }) {
  const { locale } = useLocale();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {review.user.name}
        </Text>
        <Text style={styles.date}>{formatDate(review.created_at, locale)}</Text>
      </View>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= review.rating ? 'star' : 'star-outline'}
            size={14}
            color="#FFD400"
          />
        ))}
      </View>

      {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8A8A',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 6,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#C7C7C7',
  },
});
