import PDFDocument from 'pdfkit';
import { QrCodeGenerator } from './QrCodeGenerator';

interface PaymentSlipData {
  userId: string;
  user: string;
  invoiceId: string;
  amount: number;
  parkingName: string;
  dueDate: Date;
}

export class PdfGenerator {

  /**
   * Genera un PDF Bollettino di Pagamento con QR Code.
   */
  static async createPaymentSlip(data: PaymentSlipData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Crea il documento PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        // Gestione stream in memoria
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // 2. Genera stringa QR: <user id>|<id fattura>|<importo>
        const qrString = `${data.userId}|${data.invoiceId}|${data.amount.toFixed(2)}`;
        const qrBuffer = await QrCodeGenerator.generateBuffer(qrString);

        // 3. Disegna il PDF
        
        // --- HEADER ---
        doc.fontSize(20).font('Helvetica-Bold').text('BOLLETTINO DI PAGAMENTO', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text(`Parcheggio: ${data.parkingName}`, { align: 'center' });
        doc.moveDown(2);

        // --- INFO PAGAMENTO ---
        const startX = 50;
        let currentY = doc.y;

        doc.fontSize(12).font('Helvetica-Bold').text('Dettagli Pagamento:', startX, currentY);
        doc.moveDown(0.5);
        
        doc.font('Helvetica').text(`Causale: Pagamento Sosta`);
        doc.text(`ID Fattura: ${data.invoiceId}`);
        doc.text(`ID Utente: ${data.userId}`);
        doc.text(`Utente: ${data.user}`);
        doc.text(`Scadenza: ${data.dueDate.toLocaleDateString('it-IT')}`);
        doc.moveDown(1);

        // --- IMPORTO (Grande e Chiaro) ---
        doc.fontSize(16).font('Helvetica-Bold').text(`Totale da Pagare: € ${data.amount.toFixed(2)}`, { align: 'right' });
        
        // --- QR CODE (Centrato in basso) ---
        doc.moveDown(2);
        const qrSize = 150;
        const pageCenter = (doc.page.width - qrSize) / 2;
        
        doc.image(qrBuffer, pageCenter, doc.y, { fit: [qrSize, qrSize] });
        
        doc.moveDown(12); // Spazio dopo l'immagine
        doc.fontSize(10).font('Helvetica-Oblique').text('Scansiona il QR Code per procedere al pagamento.', { align: 'center' });
        doc.text(`Codice stringa: ${qrString}`, { align: 'center' });

        // 4. Chiudi documento
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  static async createTransitReport(transits: any[], from?: Date, to?: Date): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(18).text('Report Storico Transiti', { align: 'center' });
      doc.fontSize(10).text(`Periodo: ${from?.toLocaleDateString() || 'Inizio'} - ${to?.toLocaleDateString() || 'Oggi'}`, { align: 'center' });
      doc.moveDown(2);

      // Table Header (Semplice, senza librerie esterne per tabelle)
      const yStart = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Data/Ora', 30, yStart);
      doc.text('Targa', 130, yStart);
      doc.text('Tipo', 200, yStart);
      doc.text('Varco', 280, yStart);
      doc.text('Img', 450, yStart); // Info extra
      
      doc.moveTo(30, yStart + 15).lineTo(550, yStart + 15).stroke();
      doc.moveDown();

      // Table Rows
      doc.font('Helvetica');
      transits.forEach((t) => {
        const y = doc.y;
        if (y > 750) doc.addPage(); // Nuova pagina se serve

        const dateStr = new Date(t.dateTime).toLocaleString('it-IT');
        doc.text(dateStr, 30, y);
        doc.text(t.vehicleId, 130, y);
        doc.text(t.transitType, 200, y);
        doc.text(t.gateId.substring(0, 8) + '...', 280, y); // ID Varco accorciato
        doc.text(t.imagePath ? 'Sì' : 'No', 450, y);
        
        doc.moveDown(0.5);
      });

      doc.end();
    });
  }
}
