import tesseract from "node-tesseract-ocr";
import sharp from "sharp";
import fs from "fs";

/**
 * Preprocessa l'immagine per migliorare il riconoscimento OCR. 
 */
async function preprocessImageToBuffer(src: string): Promise<Buffer> {
  const img = sharp(src);
  const meta = await img.metadata();
  const width = meta.width ?? 800;

  return await img
    .resize(Math.round(width * 1.2)) 
    .greyscale()
    .gamma(1.1)                     
    .toBuffer();
}

/**
 * Riconosce la targa da un buffer di immagine.
 */
async function recognizePlateFromBuffer(buffer: Buffer): Promise<string | null> {
  const baseConfig = {
    lang: "eng",
    oem: 1,
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  };

  const psms = [13, 7, 6];

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