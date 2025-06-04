import React, { useContext, useState, ChangeEvent, FormEvent } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { DIALOGUE_THEMES_LIST, DEFAULT_SETTINGS } from '../constants';
import { DialogueTheme } from '../types';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings: contextResetSettings } = useContext(SettingsContext);
  const [localSettings, setLocalSettings] = useState(settings);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (theme: DialogueTheme) => {
    setLocalSettings(prev => {
      const activeThemes = prev.activeThemes.includes(theme)
        ? prev.activeThemes.filter(t => t !== theme)
        : [...prev.activeThemes, theme];
      return { ...prev, activeThemes };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setSavedMessage("Settings saved successfully! ✨ Your changes are now active.");
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const handleReset = () => {
    contextResetSettings(); 
    setSavedMessage("Settings have been reset to their defaults. Save to apply them or continue editing.");
    setTimeout(() => setSavedMessage(null), 4000);
  };
  
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white/90 border border-amber-400 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-neutral-700 placeholder-neutral-400";
  const labelClass = "block text-sm font-medium text-amber-700";
  const sectionClass = "p-5 sm:p-6 bg-white/60 backdrop-blur-md shadow-xl rounded-xl border border-amber-300";


  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-600">
        Customize Your AI Assistant
      </h2>

      {settings.apiKeyStatus === 'missing' && (
         <div className="p-3.5 mb-5 rounded-md text-sm bg-red-100 text-red-700 border border-red-300 shadow-sm">
            <strong>API Key Notice:</strong> The <code>API_KEY</code> environment variable is not set.
            While you can configure settings here, conversation generation will be disabled until the API key is available.
            This application does not allow direct input of the API key through the UI.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className={sectionClass}>
          <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">Basic Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="userName" className={labelClass}>Your Name (as User):</label>
              <input type="text" name="userName" id="userName" value={localSettings.userName} onChange={handleChange} className={inputClass} placeholder="E.g., Alex, Storyteller" />
            </div>
            <div>
              <label htmlFor="aiName" className={labelClass}>AI's Name:</label>
              <input type="text" name="aiName" id="aiName" value={localSettings.aiName} onChange={handleChange} className={inputClass} placeholder="E.g., IRIS, Codex" />
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">AI Personality & Style</h3>
          <div>
            <label htmlFor="aiPersonality" className={labelClass}>AI Personality Description:</label>
            <textarea name="aiPersonality" id="aiPersonality" rows={8} value={localSettings.aiPersonality} onChange={handleChange} className={inputClass + " min-h-[120px] sm:min-h-[150px]"} placeholder="Describe AI's traits, tone, quirks, e.g., 'A witty librarian with a love for ancient scrolls and a dry sense of humor...'" />
            <p className="mt-1 text-xs text-neutral-500">This core description guides the AI's responses. Be descriptive!</p>
          </div>
          <div className="mt-4">
            <label htmlFor="conversationStyle" className={labelClass}>Additional Conversation Style Notes:</label>
            <textarea name="conversationStyle" id="conversationStyle" rows={4} value={localSettings.conversationStyle} onChange={handleChange} className={inputClass + " min-h-[70px] sm:min-h-[80px]"} placeholder="E.g., 'Uses short, punchy sentences.', 'Often quotes philosophers.'"/>
            <p className="mt-1 text-xs text-neutral-500">Specific instructions for dialogue style (e.g., use more humor, avoid slang).</p>
          </div>
        </div>
        
        <div className={sectionClass}>
          <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">Dialogue Themes ({localSettings.activeThemes.length}/{DIALOGUE_THEMES_LIST.length} selected)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 max-h-80 sm:max-h-96 overflow-y-auto p-1.5 sm:p-2 rounded-md border border-amber-300 bg-white/50">
            {DIALOGUE_THEMES_LIST.map(theme => (
              <label key={theme} className="flex items-center space-x-2 p-1 sm:p-1.5 rounded hover:bg-amber-100/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.activeThemes.includes(theme)}
                  onChange={() => handleThemeChange(theme)}
                  className="h-4 w-4 text-orange-500 border-amber-400 rounded focus:ring-orange-400"
                />
                <span className="text-sm text-neutral-700">{theme}</span>
              </label>
            ))}
          </div>
           <p className="mt-2 text-xs text-neutral-500">Select themes for conversation generation. At least one must be active.</p>
        </div>

        {savedMessage && (
          <div className="p-3 my-3 text-sm text-green-800 bg-green-100 border border-green-300 rounded-md shadow-sm text-center">
            {savedMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4">
          <button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            💾 Save All Settings
          </button>
          <button type="button" onClick={handleReset} className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            🔄 Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;