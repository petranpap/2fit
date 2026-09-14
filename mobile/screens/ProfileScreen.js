import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import CategoryChip from '../components/CategoryChip';
import MenuListItem from '../components/MenuListItem';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { colors, radius, spacing, typography } from '../theme/tokens';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useLocale();

  const comingSoon = () => Alert.alert(t('common.comingSoonTitle'), t('common.comingSoonMessage'));

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user?.name)}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <MenuListItem
          icon="heart-outline"
          label={t('profile.favorites')}
          onPress={() => navigation.navigate('Favorites')}
        />
        <MenuListItem icon="star-outline" label={t('profile.myReviews')} onPress={comingSoon} />
        <MenuListItem icon="notifications-outline" label={t('profile.notifications')} onPress={comingSoon} />
        <MenuListItem
          icon="help-circle-outline"
          label={t('profile.help')}
          onPress={() => Linking.openURL('mailto:support@2fit.app')}
        />
        <MenuListItem icon="log-out-outline" label={t('profile.logout')} onPress={logout} danger />
      </View>

      <Text style={styles.sectionTitle}>{t('profile.languageSection')}</Text>
      <View style={styles.languageRow}>
        <CategoryChip label={t('profile.languageGreek')} selected={locale === 'el'} onPress={() => setLocale('el')} />
        <CategoryChip label={t('profile.languageEnglish')} selected={locale === 'en'} onPress={() => setLocale('en')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.heading,
    fontSize: 28,
    color: colors.primary,
  },
  name: {
    ...typography.subheading,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  menu: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  languageRow: {
    flexDirection: 'row',
  },
});
