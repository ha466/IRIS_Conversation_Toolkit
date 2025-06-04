import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings, SettingsContextType, DialogueTheme } from '../types';
import { DEFAULT_SETTINGS, DIALOGUE_THEMES_LIST } from '../constants';

export const SettingsContext = createContext<SettingsContextType>(null!);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings) as Partial<Settings>;
        // Ensure all keys from DEFAULT_SETTINGS are present, and activeThemes are valid
        const validatedThemes = Array.isArray(parsed.activeThemes)
          ? parsed.activeThemes.filter(theme => DIALOGUE_THEMES_LIST.includes(theme as DialogueTheme))
          : DEFAULT_SETTINGS.activeThemes;
          
        return { ...DEFAULT_SETTINGS, ...parsed, activeThemes: validatedThemes, apiKeyStatus: 'loading' };
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
    return { ...DEFAULT_SETTINGS, apiKeyStatus: 'loading' };
  });
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(true);


  useEffect(() => {
    // Check for API_KEY on mount and update status
    // This simulates an async check or allows future extension
    const keyPresent = !!process.env.API_KEY;
    setSettings(prev => ({ ...prev, apiKeyStatus: keyPresent ? 'present' : 'missing' }));
    setIsApiKeyMissing(!keyPresent);
  }, []);


  useEffect(() => {
    try {
      // Do not store apiKeyStatus in localStorage
      const { apiKeyStatus, ...settingsToStore } = settings;
      localStorage.setItem('appSettings', JSON.stringify(settingsToStore));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    // Preserve apiKeyStatus when resetting
    setSettings(prev => ({
        ...DEFAULT_SETTINGS,
        apiKeyStatus: prev.apiKeyStatus 
    }));
  }, []);
  

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, isApiKeyMissing }}>
      {children}
    </SettingsContext.Provider>
  );
};
