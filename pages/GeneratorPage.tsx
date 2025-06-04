import React, { useState, useCallback, useContext } from 'react';
import { ConversationObject, DialogueTheme } from '../types';
import { TOTAL_CONVERSATIONS_TO_GENERATE } from '../constants';
import { generateConversationsForTheme } from '../services/geminiService';
import ConversationCard from '../components/ConversationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SettingsContext } from '../contexts/SettingsContext';

const GeneratorPage: React.FC = () => {
  const { settings, isApiKeyMissing } = useContext(SettingsContext);
  const [generatedConversations, setGeneratedConversations] = useState<ConversationObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState<number>(0);

  const handleGenerateConversations = useCallback(async () => {
    if (isApiKeyMissing) {
        setError("Cannot generate: API_KEY is missing. Please configure it in your environment.");
        return;
    }
    if (settings.activeThemes.length === 0) {
        setError("No dialogue themes selected. Please select at least one theme in Settings.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedConversations([]);
    setGeneratedCount(0);

    let allGeneratedConvos: ConversationObject[] = [];
    const themesToProcess: DialogueTheme[] = [...settings.activeThemes];
    
    const conversationsPerThemeTarget = themesToProcess.length > 0 
        ? Math.ceil(TOTAL_CONVERSATIONS_TO_GENERATE / themesToProcess.length)
        : 0;

    if (conversationsPerThemeTarget === 0 && TOTAL_CONVERSATIONS_TO_GENERATE > 0) {
        setError("Cannot determine conversations per theme. No active themes?");
        setIsLoading(false);
        return;
    }
    
    const generationSettings = {
        userName: settings.userName,
        aiName: settings.aiName,
        aiPersonality: settings.aiPersonality,
        conversationStyle: settings.conversationStyle,
    };

    for (const theme of themesToProcess) {
      if (allGeneratedConvos.length >= TOTAL_CONVERSATIONS_TO_GENERATE) break;

      const remainingNeeded = TOTAL_CONVERSATIONS_TO_GENERATE - allGeneratedConvos.length;
      const numToGenerateForThisTheme = Math.min(conversationsPerThemeTarget, remainingNeeded);

      if (numToGenerateForThisTheme <= 0) continue;

      try {
        const themeConversations = await generateConversationsForTheme(theme, numToGenerateForThisTheme, generationSettings);
        if (themeConversations && themeConversations.length > 0) {
          allGeneratedConvos = [...allGeneratedConvos, ...themeConversations];
          // Update preview dynamically
          setGeneratedConversations(currentConvos => [...currentConvos, ...themeConversations].slice(0, TOTAL_CONVERSATIONS_TO_GENERATE));
          setGeneratedCount(currentCount => Math.min(currentCount + themeConversations.length, TOTAL_CONVERSATIONS_TO_GENERATE));
        } else {
          console.warn(`No conversations returned for theme: ${theme}`);
        }
      } catch (err) {
        console.error(`Error generating conversations for theme ${theme}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed for theme ${theme}: ${errorMessage}. Generation stopped.`);
        setIsLoading(false);
        return; 
      }
    }
    
    const finalConversations = allGeneratedConvos.slice(0, TOTAL_CONVERSATIONS_TO_GENERATE);
    setGeneratedConversations(finalConversations);
    setGeneratedCount(finalConversations.length);
    setIsLoading(false);

    if (finalConversations.length < TOTAL_CONVERSATIONS_TO_GENERATE && !error) {
      setError(`Process finished. Generated ${finalConversations.length}/${TOTAL_CONVERSATIONS_TO_GENERATE} conversations. Some themes/requests might have yielded fewer results. Check console for details.`);
    } else if (!error && finalConversations.length > 0) {
        setError(null); 
    } else if (finalConversations.length === 0 && !error) {
        setError("No conversations were generated. The model might not have produced any output for the selected themes or an unknown issue occurred.");
    }
  }, [settings, isApiKeyMissing]);

  const handleDownloadJson = useCallback(() => {
    if (generatedConversations.length === 0) {
      alert("No conversations generated yet to download.");
      return;
    }
    const jsonString = JSON.stringify(generatedConversations, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${settings.aiName}_conversations_dataset_${generatedConversations.length}_samples.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedConversations, settings.aiName]);

  return (
    <div className="w-full bg-white/60 backdrop-blur-md shadow-xl rounded-xl p-5 sm:p-8 border border-amber-300">
      <p className="text-sm text-neutral-600 mb-4 text-center">
        Generate a dataset of up to {TOTAL_CONVERSATIONS_TO_GENERATE} unique conversations with <strong className="text-amber-700">{settings.aiName}</strong>, using the themes and personality defined in settings.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-6">
        <button
          onClick={handleGenerateConversations}
          disabled={isLoading || isApiKeyMissing || settings.activeThemes.length === 0}
          className="flex-grow bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          aria-label={`Generate ${TOTAL_CONVERSATIONS_TO_GENERATE} conversations with ${settings.aiName}`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="w-5 h-5 mr-2" color="text-white" />
              Generating... ({generatedCount}/{TOTAL_CONVERSATIONS_TO_GENERATE})
            </>
          ) : (
            `✨ Generate Dataset (${settings.activeThemes.length} themes)`
          )}
        </button>
        <button
          onClick={handleDownloadJson}
          disabled={isLoading || generatedConversations.length === 0}
          className="flex-grow sm:flex-grow-0 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          💾 Download JSON
        </button>
      </div>

      {error && (
        <div className={`p-3 mb-4 rounded-md text-sm ${isApiKeyMissing ? 'bg-red-100 text-red-700 border-red-300' : 'bg-orange-100 text-orange-800 border-orange-300'} border shadow-sm`}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {settings.activeThemes.length === 0 && !isLoading && !isApiKeyMissing && (
         <div className="p-3 mb-4 rounded-md text-sm bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm">
            <strong>Notice:</strong> No dialogue themes are currently selected. Please go to Settings to enable themes for generation.
        </div>
      )}


      {isLoading && generatedCount < TOTAL_CONVERSATIONS_TO_GENERATE && !error && (
         <div className="text-center text-amber-700 my-4">
           <p>Summoning dialogues with {settings.aiName}... ☕🎀</p>
           <p className="text-xs">Generated {generatedCount} of {TOTAL_CONVERSATIONS_TO_GENERATE} (target) conversations.</p>
         </div>
      )}
      
      {!isLoading && generatedConversations.length > 0 && !error && (
          <div className="text-center text-green-700 my-4 p-3 bg-green-100/70 border border-green-300 rounded-md shadow-sm">
              Successfully generated {generatedConversations.length} conversations! You can now download the JSON.
          </div>
      )}
      {!isLoading && generatedConversations.length === 0 && generatedCount > 0 && !error && ( // This implies generation finished but yielded 0.
           <div className="text-center text-yellow-700 my-4 p-3 bg-yellow-100/70 border border-yellow-300 rounded-md shadow-sm">
              Generation complete, but it seems no conversations were produced for the selected themes. Try adjusting settings or themes.
          </div>
      )}

      {generatedConversations.length > 0 && (
        <div className="mt-5">
            <h2 className="text-xl font-semibold text-center mb-3 text-amber-800">Generated Conversations Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto p-1 rounded-lg bg-amber-50/30 ">
                {generatedConversations.map((convo, index) => (
                  <ConversationCard key={`${convo.theme}-${index}-${Math.random()}`} conversationObject={convo} index={index} userName={settings.userName} aiName={settings.aiName} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorPage;