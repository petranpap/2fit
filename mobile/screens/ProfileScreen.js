import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function ProfileMenuItem({
  icon,
  label,
  onPress,
  danger = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View style={styles.menuLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? '#FF5A5A' : '#FFD400'}
        />

        <Text
          style={[
            styles.menuLabel,
            danger && styles.dangerLabel,
          ]}
        >
          {label}
        </Text>
      </View>

      {!danger && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#FFD400"
        />
      )}
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useLocale();

  const comingSoon = () =>
    Alert.alert(
      t('common.comingSoonTitle'),
      t('common.comingSoonMessage')
    );

  return (
    <ScreenContainer
      edges={['top']}
      style={styles.screen}
    >
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials(user?.name)}
          </Text>
        </View>

        <Text style={styles.name}>
          {user?.name}
        </Text>

        <Text style={styles.email}>
          {user?.email}
        </Text>
      </View>

      <View style={styles.menuCard}>
        <ProfileMenuItem
          icon="heart-outline"
          label={t('profile.favorites')}
          onPress={() => navigation.navigate('Favorites')}
        />

        <ProfileMenuItem
          icon="star-outline"
          label={t('profile.myReviews')}
          onPress={comingSoon}
        />

        <ProfileMenuItem
          icon="notifications-outline"
          label={t('profile.notifications')}
          onPress={comingSoon}
        />

        <ProfileMenuItem
          icon="help-circle-outline"
          label={t('profile.help')}
          onPress={() =>
            Linking.openURL('mailto:support@2fit.app')
          }
        />

        <ProfileMenuItem
          icon="log-out-outline"
          label={t('profile.logout')}
          onPress={logout}
          danger
        />
      </View>

      <Text style={styles.sectionTitle}>
        {t('profile.languageSection')}
      </Text>

      <View style={styles.languageRow}>
        <Pressable
          onPress={() => setLocale('el')}
          style={[
            styles.languageButton,
            locale === 'el' &&
              styles.languageButtonSelected,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              locale === 'el' &&
                styles.languageTextSelected,
            ]}
          >
            {t('profile.languageGreek')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setLocale('en')}
          style={[
            styles.languageButton,
            locale === 'en' &&
              styles.languageButtonSelected,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              locale === 'en' &&
                styles.languageTextSelected,
            ]}
          >
            {t('profile.languageEnglish')}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#111111',
  },

  headerCard: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: spacing.xl,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFD400',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111111',
  },

  name: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  email: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: '#D0D0D0',
    marginTop: 6,
  },

  menuCard: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },

  menuItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },

  menuItemPressed: {
    backgroundColor: '#242424',
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  dangerLabel: {
    color: '#FF5A5A',
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },

  languageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.xl,
  },

  languageButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  languageButtonSelected: {
    backgroundColor: '#FFD400',
    borderColor: '#FFFFFF',
  },

  languageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },

  languageTextSelected: {
    color: '#111111',
  },
});