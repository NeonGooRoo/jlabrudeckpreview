import { Card } from '../types';
import { SHEET_TSV_URL } from '../constants';

// Based on the provided data, these are the column indices (0-based) for sheet:
// https://docs.google.com/spreadsheets/d/1pYsAecaF7djbzj6xB8kfNxcqTKhp9AtFKlkJv4lmrW8/edit
const COLUMN_MAP = {
  ID: 1,
  DECK_NAME: 2,
  SOUND: 3,
  IMAGE: 4,
  NOTE_ENG: 5,
  NOTE_RUS: 6, // Column G
  EXPLANATION_ENG: 7,
  EXPLANATION_RUS: 8,
  EXPLANATION_RUS_DETAILED: 10, // Column K
  JAPANESE_SENTENCE: 14, // Column O
  JAPANESE_PHRASE: 15, // Column P
  EXTERNAL_LINK_RUS: 16, // Column Q
  JAPANESE_SENTENCE_FURIGANA: 17, // Column R
  ROMAJI: 28,
};


// Simple TSV parser
const parseTSV = (tsv: string): string[][] => {
  return tsv.split('\n').map(row => row.split('\t').map(cell => cell.trim()));
};

export const fetchCards = async (): Promise<Card[]> => {
  const response = await fetch(SHEET_TSV_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const tsvData = await response.text();
  const rows = parseTSV(tsvData);
  
  // Skip header row (index 0)
  const cardData: Card[] = rows.slice(1).map((row, index) => {
    // A simple function to safely get cell data or return an empty string
    const getCell = (colIndex: number) => row[colIndex] || '';

    return {
      rowNumber: index + 2, // Spreadsheet rows are 1-based, and we skipped the header
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
  }).filter(card => card.id && card.japanesePhrase); // Ensure card has essential data

  return cardData;
};