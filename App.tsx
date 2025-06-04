import React, { useState, useContext, useEffect } from 'react';
import { SettingsProvider, SettingsContext } from './contexts/SettingsContext';
import IntroPage from './pages/IntroPage';
import GeneratorPage from './pages/GeneratorPage';
import SettingsPage from './pages/SettingsPage';
import { PageView } from './types';
import { GITHUB_REPO_URL } from './constants';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<PageView>('intro');
  const { settings, isApiKeyMissing } = useContext(SettingsContext);

  // Effect to check if it's the first visit to show intro
  // This simple check can be expanded (e.g., using localStorage)
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedAppBefore');
    if (hasVisitedBefore) {
      setCurrentView('generator'); // Default to generator if not first visit
    } else {
      setCurrentView('intro');
    }
  }, []);

  const handleSetView = (view: PageView) => {
    setCurrentView(view);
    if (view !== 'intro') {
      localStorage.setItem('hasVisitedAppBefore', 'true');
    }
  };


  const NavLink: React.FC<{ view: PageView; label: string }> = ({ view, label }) => (
    <button
      onClick={() => handleSetView(view)}
      className={`px-3 py-2 sm:px-4 rounded-md text-sm font-medium transition-colors duration-200
        ${currentView === view 
          ? 'bg-amber-600 text-white shadow-md' // Amber for active link
          : 'text-amber-700 hover:bg-amber-100 hover:text-amber-800'
        }`}
      aria-current={currentView === view ? 'page' : undefined}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen items-center w-full p-3 sm:p-5">
      {/* Header and Navigation - Conditionally render based on view */}
      {currentView !== 'intro' && (
        <header className="w-full max-w-7xl mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 bg-white/60 backdrop-blur-md shadow-lg rounded-xl border border-amber-300">
            <h1 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 mb-2 sm:mb-0">
              {settings.aiName} 🎀 Conversation Toolkit
            </h1>
            <nav className="flex space-x-1 sm:space-x-2">
              <NavLink view="generator" label="✨ Generator" />
              <NavLink view="settings" label="⚙️ Settings" />
            </nav>
          </div>
          {isApiKeyMissing && currentView === 'generator' && (
            <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center shadow">
              <strong>API Key Missing:</strong> Generation features are disabled. Please set the <code>API_KEY</code> environment variable.
              Settings can still be configured.
            </div>
          )}
        </header>
      )}

      {/* Page Content */}
      <main className="w-full max-w-7xl flex-grow">
        {currentView === 'intro' && <IntroPage setView={handleSetView} />}
        {currentView === 'generator' && <GeneratorPage />}
        {currentView === 'settings' && <SettingsPage />}
      </main>

      {/* Footer - Conditionally render based on view */}
      {currentView !== 'intro' && (
        <footer className="w-full max-w-7xl text-center mt-6 sm:mt-8 py-3 sm:py-4 border-t border-amber-400/50">
          <p className="text-neutral-700 text-xs">
            {settings.aiName} concept & initial personality by the original prompter. Application by a helpful AI.
            <br />
            Check out the <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-orange-600 underline">GitHub repository</a>.
          </p>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;