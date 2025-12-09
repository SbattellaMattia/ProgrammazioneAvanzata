import QRCode from 'qrcode';

export class QrCodeGenerator {
  
  /**
   * Genera un QR Code come Buffer (PNG) da una stringa di testo.
   * @param text Il contenuto del QR Code
   */
  static async generateBuffer(text: string): Promise<Buffer> {
    try {
      // toBuffer genera direttamente un buffer PNG
      return await QRCode.toBuffer(text, {
        errorCorrectionLevel: 'H', // Alta correzione errori
        margin: 1,
        width: 300, // Dimensione immagine px
        color: {
          dark: '#000000',  // Colore QR
          light: '#ffffff'  // Sfondo bianco
        }
      });
    } catch (error) {
      throw new Error(`Errore generazione QR Code: ${error}`);
    }
  }
}
