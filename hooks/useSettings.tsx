import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import i18n from 'i18next';

// ── Types ────────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ro';

export type Settings = {
  // Appearance
  themeMode: ThemeMode;
  // Language
  language: Language;
  // Notifications
  expiryReminders: boolean;
  reminderDaysBefore: number;
  // Camera / Scanning
  autoScan: boolean;
  saveScanHistory: boolean;
  // Account
  userName: string;
  userEmail: string;
};

type SettingsContextValue = Settings & {
  resolvedTheme: 'light' | 'dark';
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
};

// ── Defaults ─────────────────────────────────────────────────────────────────

const defaultSettings: Settings = {
  themeMode: 'system',
  language: 'en',
  expiryReminders: true,
  reminderDaysBefore: 2,
  autoScan: true,
  saveScanHistory: true,
  userName: 'John Doe',
  userEmail: 'john.doe@example.com',
};

const STORAGE_KEY = '@freshtrack_settings';

// ── Context ──────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  resolvedTheme: 'dark',
  updateSetting: () => {},
});

export const useSettings = () => useContext(SettingsContext);

// ── Provider ─────────────────────────────────────────────────────────────────

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
        }
      } catch {
        // ignore – use defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist whenever settings change (after initial load)
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
    }
  }, [settings, loaded]);

  // Keep i18n language in sync
  useEffect(() => {
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Resolve actual theme
  const systemScheme = Appearance.getColorScheme() ?? 'dark';
  const resolvedTheme: 'light' | 'dark' = settings.themeMode === 'system' ? systemScheme : settings.themeMode;

  if (!loaded) return null; // avoid flash

  return <SettingsContext.Provider value={{ ...settings, resolvedTheme, updateSetting }}>{children}</SettingsContext.Provider>;
};
