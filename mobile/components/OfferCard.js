import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../i18n/LocaleContext';
import { formatDiscount } from '../utils/offers';
import { formatOfferDate } from '../utils/formatOfferDate';

export default function OfferCard({ offer }) {
  const { t } = useLocale();
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{formatDiscount(offer, t)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{offer.title}</Text>
        {offer.offerable ? (
          <Text style={styles.at} numberOfLines={1}>
            {t('offers.at', { name: offer.offerable.name })}
          </Text>
        ) : null}
        {offer.expires_at ? (
          <Text style={styles.expiry}>
            {t('offers.expiresOn', { date: formatOfferDate(offer.expires_at) })}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A',
    borderColor: '#FFD400', borderWidth: 1, borderRadius: 16,
    padding: 14, marginBottom: 12,
  },
  pressed: { opacity: 0.8 },
  badge: {
    backgroundColor: '#FFD400', borderRadius: 9,
    paddingHorizontal: 10, paddingVertical: 8, marginRight: 12,
  },
  badgeText: { color: '#111111', fontWeight: '800', fontSize: 15 },
  body: { flex: 1 },
  title: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  at: { color: '#FFD400', marginTop: 5, fontSize: 13 },
  expiry: { color: '#D0D0D0', marginTop: 4, fontSize: 12 },
});
