import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Locales
import en from './locales/en.json';
import ro from './locales/ro.json';

const resources = {
  en: {
    translation: en,
  },
  ro: {
    translation: ro,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0]?.languageCode || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});
