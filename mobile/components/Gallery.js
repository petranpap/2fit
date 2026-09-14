import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors } from '../theme/tokens';

const HEIGHT = 220;

/**
 * Swipeable image gallery for a place's detail screen. The data model only
 * carries one photo per listing right now (logo/cover/photo), so `images`
 * is usually 0-1 items — this stays a real gallery (not a single-image
 * component) so it's ready when multi-photo upload lands later.
 */
export default function Gallery({ images = [], placeholderIcon = 'image-outline' }) {
  const { width } = useWindowDimensions();

  if (images.length === 0) {
    return (
      <View style={[styles.frame, styles.placeholder]}>
        <Ionicons name={placeholderIcon} size={40} color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.frame}>
      {images.map((uri) => (
        <Image key={uri} source={{ uri }} style={[styles.image, { width }]} resizeMode="cover" />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: HEIGHT,
  },
  placeholder: {
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: HEIGHT,
  },
});
