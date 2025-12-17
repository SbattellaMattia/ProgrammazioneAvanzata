import tesseract from "node-tesseract-ocr";
import sharp from "sharp";
import fs from "fs";

/**
 * Preprocessa un'immagine di input rendendola più adatta al riconoscimento OCR.
 *
 * L'obiettivo di questa fase è aumentare la probabilità che Tesseract riconosca correttamente
 * caratteri alfanumerici tipici delle targhe.
 *
 * Operazioni eseguite:
 * - ridimensionamento  per aumentare la dimensione dei caratteri
 * - conversione in scala di grigi
 * - aumento il contrasto
 *
 * @param src Risorsa
 * @returns Buffer dell'immagine preprocessata pronto per l'OCR
 */
async function preprocessImageToBuffer(src: string): Promise<Buffer> {
  const img = sharp(src);

  // Recuperiamo i metadata per ottenere la larghezza originale
  const meta = await img.metadata();
  const width = meta.width ?? 800;

  return await img
    .resize(Math.round(width * 1.2)) 
    .greyscale()
    .gamma(1.1)                     
    .toBuffer();
}

/**
 * Esegue il riconoscimento OCR su un buffer di immagine
 *
 * La funzione:
 * - esegue più tentativi OCR usando diversi Page Segmentation Mode (PSM)
 * - normalizza il testo riconosciuto
 * - valida il risultato tramite regex (strict e loose)
 *
 * @param buffer Buffer dell'immagine preprocessata
 * @returns La targa riconosciuta (normalizzata) oppure null se non trovata
 */
async function recognizePlateFromBuffer(buffer: Buffer): Promise<string | null> {
  const baseConfig = {
    // OEM 1: motore LSTM & whitelist: limitiamo il riconoscimento solo a lettere e numeri
    lang: "eng",
    oem: 1,
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  };

  // 13: linea di testo sparsa & 7: singola riga di testo & 6: blocco uniforme di testo
  const psms = [13, 7, 6];

  // Regex
  const strictRegex = /[A-Z]{2}[0-9]{3}[A-Z]{2}|[A-Z]{2}[0-9]{5}/;
  const looseRegex  = /[A-Z]{2}[A-Z0-9]{3,7}/;

  const charMap: Record<string, string> = {
    S: "8",
  };

  for (const psm of psms) {
    const config = { ...baseConfig, psm };
    const rawText = await tesseract.recognize(buffer, config);


    let cleaned = rawText.toUpperCase().replace(/[^A-Z0-9]/g, "");

    cleaned = cleaned
      .split("")
      .map((c) => charMap[c] ?? c)
      .join("");

    
    const strictMatch = cleaned.match(strictRegex);
    if (strictMatch) return strictMatch[0];


    
    const looseMatch = cleaned.match(looseRegex);
    if (looseMatch) {
      const candidate = looseMatch[0];      
      const letters = candidate.slice(0, 2);

      let rest = candidate
        .slice(2)
        
        .replace(/[^0-9]/g, "");           

      if (rest.length >= 5) {
        rest = rest.slice(-5);
        return letters + rest;
      }
    }
  }

  return null;
}

export async function ocr(imagePath: string): Promise<string | null> {
  if (!fs.existsSync(imagePath)) return null;

  const buffer = await preprocessImageToBuffer(imagePath);
  return recognizePlateFromBuffer(buffer);
}