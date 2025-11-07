
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './types';
import { fetchCards } from './services/sheetService';
import CardPreview from './components/CardPreview';
import Spinner from './components/Spinner';
import { GithubIcon } from './components/Icons';
import { translations } from './i18n/translations';

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ru'>('en');

  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCards = await fetchCards();
        setCards(fetchedCards);
        if (fetchedCards.length > 0) {
          // Select an initial random card
          setCurrentCard(fetchedCards[Math.floor(Math.random() * fetchedCards.length)]);
        }
      } catch (err) {
        setError('Failed to fetch or parse card data. Please check the spreadsheet URL and format.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCards();
  }, []);

  const showRandomCard = useCallback(() => {
    if (cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * cards.length);
      setCurrentCard(cards[randomIndex]);
    }
  }, [cards]);

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center justify-center p-4 selection:bg-sky-400 selection:text-slate-900 relative">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button 
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'en' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('ru')}
          className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'ru' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          RU
        </button>
      </div>

      <header className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
          {t.appTitle}
        </h1>
        <p className="text-slate-400 mt-2">
          {t.appSubtitle}
        </p>
      </header>

      <main className="w-full flex-grow flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Spinner />
            <p className="mt-4 text-slate-300">{t.loadingMessage}</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
            <p className="font-bold">{t.errorMessageHeader}</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <button
              onClick={showRandomCard}
              disabled={cards.length === 0}
              className="mb-8 px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-lg hover:bg-sky-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
            >
              {t.randomCardButton}
            </button>
            {currentCard ? (
              <CardPreview card={currentCard} language={language} />
            ) : (
              <p>{t.noCardsMessage}</p>
            )}
          </>
        )}
      </main>
       <footer className="w-full max-w-2xl text-center mt-8 text-slate-500">
        <a href="https://github.com/google/generative-ai-docs/tree/main/app-integration/building-an-app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-sky-400 transition-colors">
          <GithubIcon />
          {t.githubLink}
        </a>
      </footer>
    </div>
  );
};

export default App;
