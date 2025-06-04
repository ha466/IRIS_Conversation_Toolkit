import React, { useContext } from 'react';
import { PageView } from '../types';
import { SettingsContext } from '../contexts/SettingsContext';

interface IntroPageProps {
  setView: (view: PageView) => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ setView }) => {
  const { settings } = useContext(SettingsContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <div className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-xl p-8 sm:p-12 md:p-16 max-w-3xl w-full border border-amber-300">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-600">
          Welcome to the {settings.aiName} 🎀 Conversation Toolkit!
        </h1>
        <p className="text-base sm:text-lg text-neutral-700 mb-3">
          Hello there, creative soul! ✨ You've stumbled upon a special place where you can craft unique, multi-turn dialogues with <strong className="text-amber-700">{settings.aiName}</strong>, our charming AI assistant.
        </p>
        <p className="text-base sm:text-lg text-neutral-700 mb-6">
          Whether you're building a dataset, exploring AI personalities, or just curious, this toolkit empowers you to generate conversations across various themes, tailored to your liking. Dive in and let your creativity flow!
        </p>
        <div className="animate-bounce-slow mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
            </svg>
        </div>
        <button
          onClick={() => setView('generator')}
          className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
          aria-label={`Get started with ${settings.aiName} conversation generator`}
        >
          📚 Let's Get Started!
        </button>
         <p className="text-xs text-neutral-500 mt-8">
            You can always tweak <strong className="text-amber-600">{settings.aiName}</strong>'s personality, your name, and active themes in the ⚙️ Settings page later.
        </p>
      </div>
      <footer className="w-full max-w-7xl text-center mt-12 py-3">
          <p className="text-neutral-600 text-xs">
            {settings.aiName} concept & initial personality by the original prompter. Application by a helpful AI.
          </p>
        </footer>
    </div>
  );
};

export default IntroPage;