import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import MenuListItem from '../components/MenuListItem';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme/tokens';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function comingSoon() {
  Alert.alert('Σύντομα διαθέσιμο', 'Αυτή η λειτουργία δεν είναι έτοιμη ακόμα.');
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

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
          label="Αγαπημένα"
          onPress={() => navigation.navigate('Favorites')}
        />
        <MenuListItem icon="star-outline" label="Οι αξιολογήσεις μου" onPress={comingSoon} />
        <MenuListItem icon="notifications-outline" label="Ειδοποιήσεις" onPress={comingSoon} />
        <MenuListItem
          icon="help-circle-outline"
          label="Βοήθεια & Υποστήριξη"
          onPress={() => Linking.openURL('mailto:support@2fit.app')}
        />
        <MenuListItem icon="log-out-outline" label="Αποσύνδεση" onPress={logout} danger />
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
});
