
import React, { useState } from 'react';
import { Card } from '../types';
import { GOOGLE_FORM_URL, FORM_FIELD_CARD_ID, FORM_FIELD_COMMENT, MEDIA_BASE_URL } from '../constants';
import { SendIcon } from './Icons';
import { translations } from '../i18n/translations';

interface CardPreviewProps {
  card: Card;
  language: 'en' | 'ru';
}

// A helper to render HTML content safely
const HTMLContent: React.FC<{ html: string; className?: string }> = ({ html, className }) => {
  // NOTE: Using dangerouslySetInnerHTML can be risky if the content is not trusted.
  // Here, we trust the source spreadsheet.
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

// Helper to parse Anki's sound format: [sound:filename.mp3]
const getAudioUrl = (soundField: string): string | null => {
  const match = soundField.match(/\[sound:(.*?)\]/);
  if (!match || !match[1]) {
    return null;
  }
  const fileName = match[1].trim();
  return fileName ? `${MEDIA_BASE_URL}${fileName}` : null;
};

// Helper to parse Anki's image tag: <img src="filename.jpg">
const getImageUrl = (imageField: string): string | null => {
  const match = imageField.match(/src="([^"]+)"/);
  if (!match || !match[1]) {
    return null;
  }
  const fileName = match[1].trim();
  return fileName ? `${MEDIA_BASE_URL}${fileName}` : null;
};

// Helper to render text with furigana from format: 漢字[かんじ]
const Furigana: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  // Split by the furigana pattern, keeping the delimiters
  const parts = text.split(/(\S+\[.*?\])/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/(\S+)\[(.*?)\]/);
        if (match) {
          const [, kanji, furigana] = match;
          return (
            <ruby key={index} className="contents">
              <span className="text-sky-300">{kanji}</span>
              <rt className="text-sky-500 text-xs select-none">{furigana}</rt>
            </ruby>
          );
        }
        return <span key={index} className="text-sky-300">{part}</span>;
      })}
    </>
  );
};

const CardPreview: React.FC<CardPreviewProps> = ({ card, language }) => {
  const [explanationComment, setExplanationComment] = useState('');
  const [resourceComment, setResourceComment] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [submittedType, setSubmittedType] = useState<string | null>(null);

  const audioUrl = getAudioUrl(card.sound);
  const imageUrl = getImageUrl(card.image);
  const t = translations[language];

  const handleSubmitFeedback = (comment: string, type: 'Explanation' | 'Resource' | 'General', clearComment: () => void) => {
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

  const FeedbackBox: React.FC<{
    type: 'Explanation' | 'Resource' | 'General';
    title: string;
    placeholder: string;
    comment: string;
    setComment: (value: string) => void;
  }> = ({ type, title, placeholder, comment, setComment }) => (
    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col h-full">
      <h4 className="font-semibold text-slate-200 mb-2">{title}</h4>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={placeholder}
        className="flex-grow w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 focus:ring-2 focus:ring-sky-500 transition-colors"
        rows={3}
      />
      <div className="mt-3 flex justify-end items-center gap-4 h-8">
        {submittedType === type && <p className="text-green-400 text-sm transition-opacity">{t.feedbackSubmitted}</p>}
        <button 
          onClick={() => handleSubmitFeedback(comment, type, () => setComment(''))} 
          disabled={!comment.trim()} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
          <SendIcon />
          {t.submitButton}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FRONT (LEFT) */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6 flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center">{t.front}</h3>
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-semibold break-words leading-relaxed">
                <Furigana text={card.japaneseSentenceFurigana || card.japanesePhrase} />
              </h2>
            </div>
            {imageUrl && (
              <img src={imageUrl} alt={`Card image for ${card.japanesePhrase}`} className="rounded-lg object-cover w-full h-auto max-h-60" />
            )}
            {audioUrl && (
              <audio controls src={audioUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            )}
            <div>
              <h4 className="text-cyan-400 font-bold mb-1">{t.note}</h4>
              <p className="text-slate-300">{card.noteRus || '{пусто}'}</p>
            </div>
          </div>
          
          {/* BACK (RIGHT) */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6 flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center">{t.back}</h3>
              <div>
                <h4 className="text-sky-400 font-bold mb-1">{t.sentenceJapanese}</h4>
                <p className="text-2xl">
                  <Furigana text={card.japaneseSentenceFurigana || card.japaneseSentence} />
                </p>
              </div>
              <div>
                <h4 className="text-sky-400 font-bold mb-1">{t.russianExplanation}</h4>
                <HTMLContent html={card.explanationRusDetailed} className="prose prose-invert prose-p:text-slate-300 prose-a:text-sky-400 max-w-none" />
              </div>
              {card.externalLinkRus && (
                  <div>
                      <h4 className="text-sky-400 font-bold mb-1">{t.externalLink}</h4>
                      <HTMLContent html={card.externalLinkRus} className="prose prose-invert prose-p:text-slate-300 prose-a:text-sky-400 max-w-none" />
                  </div>
              )}
          </div>
      </div>
      
      {/* Feedback Section */}
      <div className="mt-8 w-full">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">{t.submitFeedbackHeader}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeedbackBox 
              type="Explanation"
              title={t.explanationFeedbackHeader}
              placeholder={t.explanationFeedbackPlaceholder(card.id)}
              comment={explanationComment}
              setComment={setExplanationComment}
            />
            <FeedbackBox 
              type="Resource"
              title={t.resourceFeedbackHeader}
              placeholder={t.resourceFeedbackPlaceholder(card.id)}
              comment={resourceComment}
              setComment={setResourceComment}
            />
            <FeedbackBox 
              type="General"
              title={t.generalFeedbackHeader}
              placeholder={t.generalFeedbackPlaceholder(card.id)}
              comment={generalComment}
              setComment={setGeneralComment}
            />
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">{t.feedbackInstructions}</p>
      </div>
    </div>
  );
};

export default CardPreview;
