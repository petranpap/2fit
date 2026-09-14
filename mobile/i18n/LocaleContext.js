import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Localization from 'expo-localization';

import * as secureStorage from '../utils/secureStorage';
import el from './translations/el.json';
import en from './translations/en.json';

const TRANSLATIONS = { el, en };
export const SUPPORTED_LOCALES = ['el', 'en'];
const DEFAULT_LOCALE = 'el'; // Cyprus-first per design.md
const STORAGE_KEY = '2fit_locale';

function detectDeviceLocale() {
  const tag = Localization.getLocales()[0]?.languageCode;
  return SUPPORTED_LOCALES.includes(tag) ? tag : DEFAULT_LOCALE;
}

function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => acc?.[part], dict);
}

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? '');
}

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await secureStorage.getItem(STORAGE_KEY);
      setLocaleState(stored && SUPPORTED_LOCALES.includes(stored) ? stored : detectDeviceLocale());
      setIsReady(true);
    })();
  }, []);

  const setLocale = useCallback(async (next) => {
    setLocaleState(next);
    await secureStorage.setItem(STORAGE_KEY, next);
  }, []);

  // Falls back to the default locale's copy for any key missing a
  // translation, then to the raw key itself if it's missing everywhere —
  // the app never renders blank text.
  const t = useCallback(
    (key, vars) => {
      const template = resolve(TRANSLATIONS[locale], key) ?? resolve(TRANSLATIONS[DEFAULT_LOCALE], key) ?? key;
      return interpolate(template, vars);
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t, isReady }), [locale, setLocale, t, isReady]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
}
