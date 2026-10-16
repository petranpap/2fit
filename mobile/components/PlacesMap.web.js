import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';

// react-native-maps has no web renderer — Metro's .web.js resolution picks
// this file over PlacesMap.js automatically for web builds, so the native
// map module is never even imported into the web bundle.
export default function PlacesMap() {
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={40} color="#FFD400" />
      <Text style={styles.title}>{t('map.webUnsupportedTitle')}</Text>
      <Text style={styles.subtitle}>{t('map.webUnsupportedSubtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B8B8B8',
    textAlign: 'center',
  },
});
