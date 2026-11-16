
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '../i18n/LocaleContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const languages = [
    { code: 'el', flag: '🇬🇷', label: 'EL' },
    { code: 'en', flag: '🇬🇧', label: 'EN' },
  ];

  return (
    <View style={styles.container}>
      {languages.map((language) => {
        const active = locale === language.code;

        return (
          <Pressable
            key={language.code}
            onPress={() => setLocale(language.code)}
            accessibilityRole="button"
            accessibilityLabel={
              language.code === 'el' ? 'Ελληνικά' : 'English'
            }
            accessibilityState={{ selected: active }}
            style={[
              styles.button,
              active && styles.activeButton,
            ]}
          >
            <Text style={[
              styles.text,
              active && styles.activeText,
            ]}>
              {language.flag} {language.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: '#FFD600',
    borderRadius: 8,
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeButton: {
    backgroundColor: '#FFD600',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  activeText: {
    color: '#111111',
  },
});
