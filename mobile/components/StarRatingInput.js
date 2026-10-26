import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

const STARS = [1, 2, 3, 4, 5];

export default function StarRatingInput({ value, onChange, size = 36 }) {
  return (
    <View style={styles.row}>
      {STARS.map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${star}`}
        >
          <Ionicons name={star <= value ? 'star' : 'star-outline'} size={size} color="#FFD400" />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
