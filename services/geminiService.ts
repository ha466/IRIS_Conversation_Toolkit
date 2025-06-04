import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ConversationObject, DialogueTheme, Settings } from '../types';
import { GEMINI_MODEL_NAME, AI_SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';

let ai: GoogleGenAI | null = null;

const initializeAiClient = () => {
  if (ai) return ai;
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
  }
  console.error("CRITICAL: API_KEY environment variable not set. Gemini Service cannot be initialized.");
  return null;
};


const buildSystemInstruction = (settings: Pick<Settings, 'userName' | 'aiName' | 'aiPersonality' | 'conversationStyle'>): string => {
  let instruction = AI_SYSTEM_INSTRUCTION_TEMPLATE;
  instruction = instruction.replace(/\{\{userName\}\}/g, settings.userName);
  instruction = instruction.replace(/\{\{aiName\}\}/g, settings.aiName);
  instruction = instruction.replace(/\{\{aiPersonality\}\}/g, settings.aiPersonality);
  instruction = instruction.replace(/\{\{conversationStyle\}\}/g, settings.conversationStyle || "N/A");
  return instruction;
};

export const generateConversationsForTheme = async (
  theme: DialogueTheme,
  numberOfConversations: number,
  settings: Pick<Settings, 'userName' | 'aiName' | 'aiPersonality' | 'conversationStyle'>
): Promise<ConversationObject[]> => {
  const currentAi = initializeAiClient();
  if (!currentAi) {
    throw new Error("Gemini AI client is not initialized. API_KEY might be missing.");
  }

  const systemInstruction = buildSystemInstruction(settings);

  const prompt = `
Generate ${numberOfConversations} unique conversation objects for the dialogue theme: "${theme}".
The AI assistant is named "${settings.aiName}" and the user is named "${settings.userName}".

Each conversation object MUST be structured as follows:
{
  "theme": "${theme}",
  "conversation": [
    "${settings.userName}: [${settings.userName}'s first message related to the theme, e.g., '${settings.aiName}, can you help me with...']",
    "${settings.aiName}: [${settings.aiName}'s first reply, embodying their personality and responding to ${settings.userName}, e.g., 'Oh, look what the digital wind blew in! Spill the tea, ${settings.userName}-chan. ☕✨']",
    "${settings.userName}: [${settings.userName}'s second message]",
    "${settings.aiName}: [${settings.aiName}'s second reply]"
    // ... continuing for 3-6 turns per participant (total 6-12 messages in the 'conversation' array)
  ]
}

The entire response MUST be a single, valid JSON array containing exactly ${numberOfConversations} such conversation objects.
Do NOT include any text, explanations, or markdown code fences (like \`\`\`json ... \`\`\`) outside of this JSON array itself.
The output must start with '[' and end with ']'.

Example of ONE conversation object that would be an element in the JSON array (using '${settings.userName}' and '${settings.aiName}'):
{
  "theme": "Music Mood Match",
  "conversation": [
    "${settings.userName}: ${settings.aiName}, I’m in my feelings today… like rainy anime episode 23 energy.",
    "${settings.aiName}: Oh no~ Someone needs a moody soundtrack and a blanket burrito 🎧🖤 Hold up, lemme summon Hari’s rainy-day playlist—warning: it's 87% sad violins and 13% dramatic piano. 😭",
    "${settings.userName}: Okay but... I’m kinda into that vibe 👀",
    "${settings.aiName}: Knew it~ You're totally the protagonist energy today. Cue the opening credits, dramatic window stare, and a soft lo-fi drop. ☔✨",
    "${settings.userName}: You always get me. Hari’s taste isn't *that* bad I guess.",
    "${settings.aiName}: Don’t let him hear you say that. He once added a dubstep remix of a lullaby. I crashed out of protest. 💻💀"
  ]
}

Now, generate the JSON array of ${numberOfConversations} conversation objects for the theme "${theme}", featuring "${settings.userName}" and "${settings.aiName}".
`;

  try {
    console.log(`[Gemini Service] Generating ${numberOfConversations} conversations for theme: ${theme} with AI: ${settings.aiName}`);
    
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.75,
        topP: 0.95,
        topK: 40,
      }
    });
    
    const rawJsonText = response.text;
    let cleanedJsonText = rawJsonText.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanedJsonText.match(fenceRegex);
    if (match && match[1]) {
      cleanedJsonText = match[1].trim();
    }
    
    const parsedData = JSON.parse(cleanedJsonText);

    if (!Array.isArray(parsedData)) {
      console.error("[Gemini Service] Gemini response is not a JSON array. Received:", parsedData);
      throw new Error("Gemini response was not a valid JSON array as expected.");
    }

    const validatedData: ConversationObject[] = [];
    for (let i = 0; i < parsedData.length; i++) {
        const item = parsedData[i];
        if (typeof item !== 'object' || item === null || typeof item.theme !== 'string' || !Array.isArray(item.conversation)) {
            console.warn(`[Gemini Service] Invalid structure for conversation object at index ${i}. Skipping.`);
            continue;
        }
        if (item.theme !== theme) {
             console.warn(`[Gemini Service] Mismatch: Requested theme "${theme}", item theme "${item.theme}". Correcting.`);
             item.theme = theme;
        }
        if (!item.conversation.every((turn: unknown) => typeof turn === 'string')) {
            console.warn(`[Gemini Service] Not all turns in conversation object at index ${i} are strings. Skipping.`);
            continue;
        }
        // Validate turn prefixes
        item.conversation = item.conversation.map((turn: string) => {
            if (turn.toLowerCase().startsWith("user:")) {
                return `${settings.userName}:${turn.substring("user:".length)}`;
            } else if (turn.toLowerCase().startsWith("iris:")) { // Handle old default name if model outputs it
                 return `${settings.aiName}:${turn.substring("iris:".length)}`;
            } else if (turn.toLowerCase().startsWith(`${settings.aiName.toLowerCase()}:`)) {
                 return `${settings.aiName}:${turn.substring(`${settings.aiName.toLowerCase()}:`.length)}`;
            } else if (turn.toLowerCase().startsWith(`${settings.userName.toLowerCase()}:`)) {
                 return `${settings.userName}:${turn.substring(`${settings.userName.toLowerCase()}:`.length)}`;
            }
            // If no prefix matches, try to infer based on turn index or log warning
            // For now, we assume the model will follow the prompt for prefixes.
            return turn;
        });

        if (item.conversation.length < 6 || item.conversation.length > 12) {
            console.warn(`[Gemini Service] Conversation at index ${i} for theme ${theme} has ${item.conversation.length} turns, expected 6-12. Keeping it but noting deviation.`);
        }
        validatedData.push(item as ConversationObject);
    }
    
    if (validatedData.length !== numberOfConversations && validatedData.length < numberOfConversations) {
        // This can happen if the model doesn't strictly adhere to the count, especially for small numbers.
        console.warn(`[Gemini Service] Requested ${numberOfConversations} but received/validated ${validatedData.length} for theme ${theme}.`);
    }

    return validatedData;

  } catch (error) {
    console.error(`[Gemini Service] Error generating or parsing conversations for theme ${theme}:`, error);
    if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse JSON response from Gemini for theme ${theme}. Error: ${error.message}`);
    } else if (error instanceof Error) {
        throw new Error(`Gemini API or processing error for theme ${theme}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while generating conversations for theme ${theme} with Gemini.`);
  }
};
