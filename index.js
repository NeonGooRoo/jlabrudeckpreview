
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- From constants.ts ---
const SHEET_ID = '1pYsAecaF7djbzj6xB8kfNxcqTKhp9AtFKlkJv4lmrW8';
const SHEET_TSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=tsv`;
const MEDIA_BASE_URL = 'https://raw.githubusercontent.com/NeonGooRoo/AnkiDeckEdit/main/jlabfiles/';
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?usp=pp_url';
const FORM_FIELD_CARD_ID = 'entry.YOUR_CARD_ID_FIELD';
const FORM_FIELD_COMMENT = 'entry.YOUR_COMMENT_FIELD';

// --- From i18n/translations.ts ---
const translations = {
  en: {
    appTitle: 'Anki Card Previewer',
    appSubtitle: 'Review your Japanese vocabulary cards directly from Google Sheets.',
    randomCardButton: 'Show Random Card',
    loadingMessage: 'Loading cards from spreadsheet...',
    errorMessageHeader: 'Error',
    noCardsMessage: 'No cards available to display.',
    githubLink: 'View on GitHub',
    front: 'Front',
    back: 'Back',
    note: 'Note:',
    sentenceJapanese: 'Sentence (Japanese):',
    russianExplanation: 'Russian Explanation:',
    externalLink: 'External Link (Russian):',
    
    submitFeedbackHeader: 'Submit a Comment or Edit',
    submitButton: 'Submit',
    feedbackSubmitted: 'Link opened!',
    feedbackInstructions: 'This will open a pre-filled Google Form in a new tab.',

    explanationFeedbackHeader: 'Explanation Edit',
    explanationFeedbackPlaceholder: (cardId) => `Suggest a correction for card ${cardId}...`,
    resourceFeedbackHeader: 'Resource Link Suggestion',
    resourceFeedbackPlaceholder: (cardId) => `Share a useful link for ${cardId}...`,
    generalFeedbackHeader: 'General Suggestion',
    generalFeedbackPlaceholder: (cardId) => `Other comments about card ${cardId}...`,
  },
  ru: {
    appTitle: 'Просмотрщик карточек Anki',
    appSubtitle: 'Просматривайте свои японские словарные карточки прямо из Google Таблиц.',
    randomCardButton: 'Случайная карточка',
    loadingMessage: 'Загрузка карточек из таблицы...',
    errorMessageHeader: 'Ошибка',
    noCardsMessage: 'Нет доступных карточек для отображения.',
    githubLink: 'Посмотреть на GitHub',
    front: 'Лицевая сторона',
    back: 'Обратная сторона',
    note: 'Заметка:',
    sentenceJapanese: 'Предложение (японский):',
    russianExplanation: 'Объяснение на русском:',
    externalLink: 'Внешняя ссылка (русский):',

    submitFeedbackHeader: 'Отправить комментарий или правку',
    submitButton: 'Отправить',
    feedbackSubmitted: 'Ссылка открыта!',
    feedbackInstructions: 'Это откроет предварительно заполненную Google Форму в новой вкладке.',

    explanationFeedbackHeader: 'Правка объяснения',
    explanationFeedbackPlaceholder: (cardId) => `Предложите исправление для карточки ${cardId}...`,
    resourceFeedbackHeader: 'Предложение ссылки',
    resourceFeedbackPlaceholder: (cardId) => `Поделитесь полезной ссылкой для ${cardId}...`,
    generalFeedbackHeader: 'Общий комментарий',
    generalFeedbackPlaceholder: (cardId) => `Другие комментарии о карточке ${cardId}...`,
  }
};

// --- From services/sheetService.ts ---
const COLUMN_MAP = {
  ID: 1,
  DECK_NAME: 2,
  SOUND: 3,
  IMAGE: 4,
  NOTE_ENG: 5,
  NOTE_RUS: 6,
  EXPLANATION_ENG: 7,
  EXPLANATION_RUS: 8,
  EXPLANATION_RUS_DETAILED: 10,
  JAPANESE_SENTENCE: 14,
  JAPANESE_PHRASE: 15,
  EXTERNAL_LINK_RUS: 16,
  JAPANESE_SENTENCE_FURIGANA: 17,
  ROMAJI: 28,
};

const parseTSV = (tsv) => {
  return tsv.split('\n').map(row => row.split('\t').map(cell => cell.trim()));
};

const fetchCards = async () => {
  const response = await fetch(SHEET_TSV_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const tsvData = await response.text();
  const rows = parseTSV(tsvData);
  
  const cardData = rows.slice(1).map((row, index) => {
    const getCell = (colIndex) => row[colIndex] || '';

    return {
      rowNumber: index + 2,
      id: getCell(COLUMN_MAP.ID),
      deckName: getCell(COLUMN_MAP.DECK_NAME),
      sound: getCell(COLUMN_MAP.SOUND),
      image: getCell(COLUMN_MAP.IMAGE),
      noteEng: getCell(COLUMN_MAP.NOTE_ENG),
      noteRus: getCell(COLUMN_MAP.NOTE_RUS),
      explanationEng: getCell(COLUMN_MAP.EXPLANATION_ENG),
      explanationRus: getCell(COLUMN_MAP.EXPLANATION_RUS),
      explanationRusDetailed: getCell(COLUMN_MAP.EXPLANATION_RUS_DETAILED),
      externalLinkRus: getCell(COLUMN_MAP.EXTERNAL_LINK_RUS),
      japaneseSentenceFurigana: getCell(COLUMN_MAP.JAPANESE_SENTENCE_FURIGANA),
      japaneseSentence: getCell(COLUMN_MAP.JAPANESE_SENTENCE),
      japanesePhrase: getCell(COLUMN_MAP.JAPANESE_PHRASE),
      romaji: getCell(COLUMN_MAP.ROMAJI),
    };
  }).filter(card => card.id && card.japanesePhrase);

  return cardData;
};

// --- From components/Icons.tsx ---
const SendIcon = () => React.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" },
    React.createElement("path", { d: "M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" })
);

const GithubIcon = () => React.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "currentColor", viewBox: "0 0 24 24" },
    React.createElement("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" })
);

// --- From components/Spinner.tsx ---
const Spinner = () => {
  return React.createElement(
    "svg",
    {
      className: "animate-spin h-8 w-8 text-sky-400",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
    },
    React.createElement("circle", {
      className: "opacity-25",
      cx: "12",
      cy: "12",
      r: "10",
      stroke: "currentColor",
      strokeWidth: "4",
    }),
    React.createElement("path", {
      className: "opacity-75",
      fill: "currentColor",
      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
    })
  );
};

// --- From components/CardPreview.tsx ---
const HTMLContent = ({ html, className }) => {
  return React.createElement("div", { className: className, dangerouslySetInnerHTML: { __html: html } });
};

const getAudioUrl = (soundField) => {
  const match = soundField.match(/\[sound:(.*?)\]/);
  if (!match || !match[1]) return null;
  const fileName = match[1].trim();
  return fileName ? `${MEDIA_BASE_URL}${fileName}` : null;
};

const getImageUrl = (imageField) => {
  const match = imageField.match(/src="([^"]+)"/);
  if (!match || !match[1]) return null;
  const fileName = match[1].trim();
  return fileName ? `${MEDIA_BASE_URL}${fileName}` : null;
};

const Furigana = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\S+\[.*?\])/g).filter(Boolean);
  return React.createElement(
    React.Fragment,
    null,
    parts.map((part, index) => {
      const match = part.match(/(\S+)\[(.*?)\]/);
      if (match) {
        const [, kanji, furigana] = match;
        return React.createElement(
          "ruby",
          { key: index, className: "contents" },
          React.createElement("span", { className: "text-sky-300" }, kanji),
          React.createElement("rt", { className: "text-sky-500 text-xs select-none" }, furigana)
        );
      }
      return React.createElement("span", { key: index, className: "text-sky-300" }, part);
    })
  );
};

const CardPreview = ({ card, language }) => {
  const [explanationComment, setExplanationComment] = useState('');
  const [resourceComment, setResourceComment] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [submittedType, setSubmittedType] = useState(null);

  const audioUrl = getAudioUrl(card.sound);
  const imageUrl = getImageUrl(card.image);
  const t = translations[language];

  const handleSubmitFeedback = (comment, type, clearComment) => {
    if (!comment.trim()) return;

    if (GOOGLE_FORM_URL.includes('YOUR_FORM_ID')) {
      alert("Feedback submission is not configured. Please update the constants.ts file with your Google Form URL.");
      return;
    }

    const typePrefix = {
      'Explanation': 'Explanation Edit',
      'Resource': 'Resource Link Suggestion',
      'General': 'General Suggestion'
    }[type];

    const url = new URL(GOOGLE_FORM_URL);
    url.searchParams.append(FORM_FIELD_CARD_ID, card.id);
    url.searchParams.append(FORM_FIELD_COMMENT, `[${typePrefix}] ${comment}`);
    
    window.open(url.toString(), '_blank');
    clearComment();
    setSubmittedType(type);
    setTimeout(() => setSubmittedType(null), 3000);
  };

  const FeedbackBox = ({ type, title, placeholder, comment, setComment }) => React.createElement(
    "div",
    { className: "p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col h-full" },
    React.createElement("h4", { className: "font-semibold text-slate-200 mb-2" }, title),
    React.createElement("textarea", {
      value: comment,
      onChange: (e) => setComment(e.target.value),
      placeholder: placeholder,
      className: "flex-grow w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 focus:ring-2 focus:ring-sky-500 transition-colors",
      rows: 3,
    }),
    React.createElement(
      "div",
      { className: "mt-3 flex justify-end items-center gap-4 h-8" },
      submittedType === type && React.createElement("p", { className: "text-green-400 text-sm transition-opacity" }, t.feedbackSubmitted),
      React.createElement(
        "button",
        {
          onClick: () => handleSubmitFeedback(comment, type, () => setComment('')),
          disabled: !comment.trim(),
          className: "inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed",
        },
        React.createElement(SendIcon),
        t.submitButton
      )
    )
  );

  return React.createElement(
    "div",
    { className: "w-full max-w-4xl mx-auto" },
    React.createElement(
      "div",
      { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
      React.createElement(
        "div",
        { className: "bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6 flex flex-col gap-4" },
        React.createElement("h3", { className: "text-xs font-semibold uppercase tracking-widest text-slate-500 text-center" }, t.front),
        React.createElement(
          "div",
          { className: "text-center" },
          React.createElement(
            "h2",
            { className: "text-4xl md:text-5xl font-semibold break-words leading-relaxed" },
            React.createElement(Furigana, { text: card.japaneseSentenceFurigana || card.japanesePhrase })
          )
        ),
        imageUrl && React.createElement("img", { src: imageUrl, alt: `Card image for ${card.japanesePhrase}`, className: "rounded-lg object-cover w-full h-auto max-h-60" }),
        audioUrl && React.createElement("audio", { controls: true, src: audioUrl, className: "w-full" }, "Your browser does not support the audio element."),
        React.createElement(
          "div",
          null,
          React.createElement("h4", { className: "text-cyan-400 font-bold mb-1" }, t.note),
          React.createElement("p", { className: "text-slate-300" }, card.noteRus || '{пусто}')
        )
      ),
      React.createElement(
        "div",
        { className: "bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6 flex flex-col gap-4" },
        React.createElement("h3", { className: "text-xs font-semibold uppercase tracking-widest text-slate-500 text-center" }, t.back),
        React.createElement(
          "div",
          null,
          React.createElement("h4", { className: "text-sky-400 font-bold mb-1" }, t.sentenceJapanese),
          React.createElement("p", { className: "text-2xl" }, React.createElement(Furigana, { text: card.japaneseSentenceFurigana || card.japaneseSentence }))
        ),
        React.createElement(
          "div",
          null,
          React.createElement("h4", { className: "text-sky-400 font-bold mb-1" }, t.russianExplanation),
          React.createElement(HTMLContent, { html: card.explanationRusDetailed, className: "prose prose-invert prose-p:text-slate-300 prose-a:text-sky-400 max-w-none" })
        ),
        card.externalLinkRus && React.createElement(
          "div",
          null,
          React.createElement("h4", { className: "text-sky-400 font-bold mb-1" }, t.externalLink),
          React.createElement(HTMLContent, { html: card.externalLinkRus, className: "prose prose-invert prose-p:text-slate-300 prose-a:text-sky-400 max-w-none" })
        )
      )
    ),
    React.createElement(
      "div",
      { className: "mt-8 w-full" },
      React.createElement("h3", { className: "text-lg font-semibold text-slate-200 mb-4 text-center" }, t.submitFeedbackHeader),
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
        React.createElement(FeedbackBox, {
          type: "Explanation",
          title: t.explanationFeedbackHeader,
          placeholder: t.explanationFeedbackPlaceholder(card.id),
          comment: explanationComment,
          setComment: setExplanationComment,
        }),
        React.createElement(FeedbackBox, {
          type: "Resource",
          title: t.resourceFeedbackHeader,
          placeholder: t.resourceFeedbackPlaceholder(card.id),
          comment: resourceComment,
          setComment: setResourceComment,
        }),
        React.createElement(FeedbackBox, {
          type: "General",
          title: t.generalFeedbackHeader,
          placeholder: t.generalFeedbackPlaceholder(card.id),
          comment: generalComment,
          setComment: setGeneralComment,
        })
      ),
      React.createElement("p", { className: "text-xs text-slate-500 mt-4 text-center" }, t.feedbackInstructions)
    )
  );
};

// --- From App.tsx ---
const App = () => {
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCards = await fetchCards();
        setCards(fetchedCards);
        if (fetchedCards.length > 0) {
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

  return React.createElement(
    "div",
    { className: "min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center justify-center p-4 selection:bg-sky-400 selection:text-slate-900 relative" },
    React.createElement(
      "div",
      { className: "absolute top-4 right-4 z-10 flex items-center gap-2" },
      React.createElement("button", {
        onClick: () => setLanguage('en'),
        className: `px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'en' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`,
      }, "EN"),
      React.createElement("button", {
        onClick: () => setLanguage('ru'),
        className: `px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'ru' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`,
      }, "RU")
    ),
    React.createElement(
      "header",
      { className: "w-full max-w-2xl text-center mb-8" },
      React.createElement("h1", { className: "text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent" }, t.appTitle),
      React.createElement("p", { className: "text-slate-400 mt-2" }, t.appSubtitle)
    ),
    React.createElement(
      "main",
      { className: "w-full flex-grow flex flex-col items-center justify-center" },
      isLoading
        ? React.createElement(
            "div",
            { className: "flex flex-col items-center" },
            React.createElement(Spinner),
            React.createElement("p", { className: "mt-4 text-slate-300" }, t.loadingMessage)
          )
        : error
        ? React.createElement(
            "div",
            { className: "bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg" },
            React.createElement("p", { className: "font-bold" }, t.errorMessageHeader),
            React.createElement("p", null, error)
          )
        : React.createElement(
            React.Fragment,
            null,
            React.createElement(
              "button",
              {
                onClick: showRandomCard,
                disabled: cards.length === 0,
                className: "mb-8 px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-lg hover:bg-sky-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75",
              },
              t.randomCardButton
            ),
            currentCard
              ? React.createElement(CardPreview, { card: currentCard, language: language })
              : React.createElement("p", null, t.noCardsMessage)
          )
    ),
    React.createElement(
      "footer",
      { className: "w-full max-w-2xl text-center mt-8 text-slate-500" },
      React.createElement(
        "a",
        { href: "https://github.com/google/generative-ai-docs/tree/main/app-integration/building-an-app", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 hover:text-sky-400 transition-colors" },
        React.createElement(GithubIcon),
        t.githubLink
      )
    )
  );
};

// --- From index.tsx ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);
