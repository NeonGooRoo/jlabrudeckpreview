// The ID of your public Google Sheet.
// Extracted from the URL: https://docs.google.com/spreadsheets/d/1pYsAecaF7djbzj6xB8kfNxcqTKhp9AtFKlkJv4lmrW8/edit
export const SHEET_ID = '1pYsAecaF7djbzj6xB8kfNxcqTKhp9AtFKlkJv4lmrW8';

// The URL to fetch the sheet data as TSV (Tab-Separated Values).
export const SHEET_TSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=tsv`;

// --- INSTRUCTIONS FOR MEDIA (AUDIO/IMAGE) HOSTING ---
// 1. You need to host your media files (e.g., '1600420050000.jpg', '1600420050000.mp3') online.
//    A free and easy way is to use a public GitHub repository.
// 2. To serve raw files from GitHub, you need to use the raw.githubusercontent.com URL.
// 3. The URL below points to the `jlabfiles` directory in the `main` branch of the specified repository.
export const MEDIA_BASE_URL = 'https://raw.githubusercontent.com/NeonGooRoo/AnkiDeckEdit/main/jlabfiles/';

// --- INSTRUCTIONS FOR GOOGLE FORM INTEGRATION ---
// 1. Create a Google Form with two "Short answer" questions.
// 2. Name the first question "Card ID" and the second "Comment/Edit".
// 3. Click the "Send" button, go to the "Link" tab, and copy the form link.
// 4. Paste the link below, replacing 'YOUR_FORM_URL'.
// 5. Get the entry IDs:
//    - Go to the "pre-filled link" option in the form's "..." menu.
//    - Type "TEST_ID" in the "Card ID" field and "TEST_COMMENT" in the "Comment/Edit" field.
//    - Click "Get link". The URL will have `...&entry.XXXX=TEST_ID&entry.YYYY=TEST_COMMENT`.
//    - Copy the numbers for XXXX and YYYY and paste them below.
export const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?usp=pp_url';
export const FORM_FIELD_CARD_ID = 'entry.YOUR_CARD_ID_FIELD'; // e.g., 'entry.123456789'
export const FORM_FIELD_COMMENT = 'entry.YOUR_COMMENT_FIELD'; // e.g., 'entry.987654321'}