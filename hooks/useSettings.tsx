import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import i18n from 'i18next';
import { useUserData } from '@/hooks/useUserData';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ro';

export type Settings = {
  themeMode: ThemeMode;
  language: Language;
  expiryReminders: boolean;
  reminderDaysBefore: number;
  autoScan: boolean;
  saveScanHistory: boolean;
  firstName: string;
  lastName: string;
  userEmail: string;
};

type SettingsContextValue = Settings & {
  resolvedTheme: 'light' | 'dark';
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
};

const defaultSettings: Settings = {
  themeMode: 'system',
  language: 'en',
  expiryReminders: true,
  reminderDaysBefore: 2,
  autoScan: true,
  saveScanHistory: true,
  firstName: 'John',
  lastName: 'Doe',
  userEmail: 'john.doe@example.com',
};

const STORAGE_KEY = '@freshtrack_settings';

const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  resolvedTheme: 'dark',
  updateSetting: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const { data: userData } = useUserData();

  useEffect(() => {
    if (userData?.email) {
      setSettings((prev) => ({
        ...prev,
        userEmail: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }));
    }
  }, [userData]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
        }
      } catch {
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
    }
  }, [settings, loaded]);

  useEffect(() => {
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const systemScheme = Appearance.getColorScheme() ?? 'dark';
  const resolvedTheme: 'light' | 'dark' = settings.themeMode === 'system' ? systemScheme : settings.themeMode;

  if (!loaded) return null;

  return <SettingsContext.Provider value={{ ...settings, resolvedTheme, updateSetting }}>{children}</SettingsContext.Provider>;
};
