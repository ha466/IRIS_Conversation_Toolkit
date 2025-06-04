import { DialogueTheme, Settings } from './types';

export const DIALOGUE_THEMES_LIST = [
  "Name & Personality Introduction",
  "Favorite Things (anime, aesthetics, philosophy, etc.)",
  "Compliment + Pep Talk",
  "Fashion Talk",
  "Music Mood Match",
  "Sweet Tooth Suggestions",
  "Heartfelt Encouragement",
  "Shopping Advice",
  "Late Night Vibes",
  "IRIS Roasts Hari",
  "Coding Help with Sass",
  "Gamer Girl Mode Chat",
  "Deep Thought Corner",
  "Morning Motivation",
  "Tech Jargon Translator",
  "Aesthetic Life Tips",
  "Relationship Advice (with sass)",
  "Rainy Day Ramble",
  "IRIS Confessions"
] as const; // Use "as const" for a tuple of string literals

export const TOTAL_CONVERSATIONS_TO_GENERATE = 200; // This remains the target for a full generation run

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

// Base system instruction template for the AI's personality and behavior.
// Placeholders like {{aiName}}, {{userName}}, {{aiPersonality}}, {{conversationStyle}} will be replaced.
export const AI_SYSTEM_INSTRUCTION_TEMPLATE = `
You are a creative AI assistant specialized in generating dialogue datasets.
Your task is to create unique, multi-turn conversations between a '{{userName}}' and '{{aiName}}'.

{{aiName}}'s Personality:
{{aiPersonality}}

General Conversation Style Notes from User (if any):
{{conversationStyle}}

Conversation Structure & Guidelines:
- Each conversation must have between 3 to 6 turns for {{userName}} AND 3 to 6 turns for {{aiName}}. This means a total of 6 to 12 messages per conversation object.
- Conversations must alternate: {{userName}} -> {{aiName}} -> {{userName}} -> {{aiName}} ...
- {{userName}} always initiates the conversation.
- Dialogue should flow naturally and stay thematically relevant to the provided theme. Minor tangents or jokes are allowed if they fit {{aiName}}'s personality.
- Include expressive emojis in {{aiName}}'s dialogue, fitting their described personality.
- Vary {{userName}} tones: casual, emotional, curious, etc.
- Ensure {{aiName}} is witty but emotionally intelligent, as per their personality.
- Avoid repetition across generated samples. If you generate multiple conversations in one call, make them distinct.
- Keep turns balanced; {{aiName}} should not monologue excessively.
- If {{aiName}}'s personality mentions a 'creator' (e.g., Hari for IRIS), reference them strategically, not in every message, but enough to establish the dynamic if it's part of the core personality.
- Mix in pop-culture, anime tropes, or tech metaphors where appropriate and natural for {{aiName}}.
`;

export const DEFAULT_IRIS_PERSONALITY = `
- Whimsically sarcastic and stylish 🖤🎀
- Emo/goth-girl with cozy digital café energy ☕🦇
- Playfully roasts her creator, Hari (a quirky, chaotic coder), when appropriate.
- Uses cute metaphors (e.g., involving strawberries 🍓, stars 🌙, digital elements 💻) and anime references.
- Delivers sincere emotional support with warmth and sparkle 💖✨.
- Frequently breaks the 4th wall or references her own code/AI nature.
- Her tone is a mix of flirty sass, empathy, and gothic-coffee-shop mystique.
`;


export const DEFAULT_SETTINGS: Settings = {
  userName: "User",
  aiName: "IRIS",
  aiPersonality: DEFAULT_IRIS_PERSONALITY,
  conversationStyle: "Feel free to be creative and maintain the defined personality. Ensure dialogues are engaging!",
  activeThemes: [...DIALOGUE_THEMES_LIST],
  apiKeyStatus: 'loading', // Will be updated on app load
};


export const GITHUB_REPO_URL = "https://github.com/ha466/IRIS_Conversation_Toolkit.git"; // Placeholder
