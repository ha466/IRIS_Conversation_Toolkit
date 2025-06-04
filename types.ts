import { DIALOGUE_THEMES_LIST } from './constants';

// Create a union type from the DIALOGUE_THEMES_LIST values
// This ensures DialogueTheme is always one of the specified themes.
export type DialogueTheme = typeof DIALOGUE_THEMES_LIST[number];

export interface ConversationTurn {
  speaker: "User" | "IRIS"; // Will be dynamic based on settings
  text: string;
}

export interface ConversationObject {
  theme: DialogueTheme;
  conversation: string[]; // Array of alternating dialogue strings
}

// Props for ConversationCard component
export interface ConversationCardProps {
  conversationObject: ConversationObject;
  index: number;
  userName: string;
  aiName: string;
}

// Props for LoadingSpinner component
export interface LoadingSpinnerProps {
  size?: string; // e.g., 'w-8 h-8'
  color?: string; // e.g., 'text-pink-500'
}

export type PageView = 'intro' | 'generator' | 'settings';

export interface Settings {
  userName: string;
  aiName: string;
  aiPersonality: string;
  conversationStyle: string;
  activeThemes: DialogueTheme[];
  apiKeyStatus: 'loading' | 'present' | 'missing'; // For UI feedback, not for input
}

export interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  isApiKeyMissing: boolean; // Derived from settings.apiKeyStatus for convenience
}