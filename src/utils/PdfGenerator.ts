import PDFDocument from 'pdfkit';
import { ParkingStatsDTO } from '../dto/ParkingStatsDTO';
import { QrCodeGenerator } from './QrCodeGenerator';
import { InvoiceDTO } from '../dto/InvoiceDTO';
import { TransitFilterDTO } from '../dto/TransitDTO';
import Transit from '../models/Transit';

export class PdfGenerator {

  /**
   * Genera un PDF Bollettino di Pagamento con QR Code.
   */
  static async createPayment(data: InvoiceDTO): Promise<Buffer> {
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

  static async createTransitReport(transits: Transit[], from?: Date, to?: Date): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(18).text('Report Storico Transiti', { align: 'center' });
      doc.fontSize(10).text(`Periodo: Inizio:${from?.toLocaleDateString() || '-'}\tFine: ${to?.toLocaleDateString() || 'Oggi'}`, { align: 'center' });
      doc.moveDown(2);

      const yStart = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Data/Ora', 30, yStart);
      doc.text('Targa', 150, yStart);
      doc.text('Tipo', 230, yStart);
      doc.text('Varco', 300, yStart);
      
      doc.moveTo(30, yStart + 15).lineTo(550, yStart + 15).stroke();
      doc.moveDown();

      // Table Rows
      doc.font('Helvetica');
      transits.forEach((t) => {
        let y = doc.y;
        if (y > 750) {
          doc.addPage();
          y = 50;
        }

        const dateStr = new Date(t.date).toLocaleString('it-IT');
        doc.text(dateStr, 30, y);
        doc.text(t.vehicleId, 150, y);
        doc.text(t.type, 230, y);
        doc.text(t.gateId, 300, y); 
    
        doc.moveDown(0.5);
      });
      doc.end();
    });
  }

  static async createParkingStatsReport(stats: ParkingStatsDTO): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 40 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // HEADER
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Report Statistiche Parcheggio", { align: "center" });
      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Parcheggio: ${stats.parkingName} (${stats.parkingId})`, {
          align: "center",
        });
      doc.text(
        `Periodo: ${stats.from.toLocaleString(
          "it-IT"
        )}  ->  ${stats.to.toLocaleString("it-IT")}`,
        { align: "center" }
      );
      doc.moveDown(2);

      // FATTURATO
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Fatturato", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).font("Helvetica");
      doc.text(
        `Totale fatturato (tutte le fatture): € ${stats.totalRevenue.toFixed(2)}`
      );
      doc.text(
        `Totale incassato (fatture PAID):    € ${stats.paidRevenue.toFixed(2)}`
      );
      doc.text(`Numero fatture totali:               ${stats.invoiceCount}`);
      doc.moveDown(0.5);

      doc.text("Dettaglio per stato:");
      doc.text(`- Pagate (PAID):    ${stats.invoiceCountByStatus.paid}`);
      doc.text(`- Non pagate:       ${stats.invoiceCountByStatus.unpaid}`);
      doc.text(`- Scadute (EXPIRED):${stats.invoiceCountByStatus.expired}`);
      doc.moveDown(1.5);

      // TRANSITI - RIEPILOGO
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Transiti", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).font("Helvetica");
      doc.text(
        `Numero totale transiti nel periodo: ${stats.transits.total}`
      );
      doc.text(`- Ingresso (IN):  ${stats.transits.byType.in}`);
      doc.text(`- Uscita  (OUT): ${stats.transits.byType.out}`);
      doc.moveDown(1);

      // TRANSITI PER TIPO VEICOLO
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("Transiti per tipologia veicolo");
      doc.moveDown(0.5);

      doc.fontSize(11).font("Helvetica");

      const vehicleTypes = Object.entries(stats.transits.byVehicleType);
      if (vehicleTypes.length === 0) {
        doc.text("Nessun dato disponibile.");
      } else {
        vehicleTypes.forEach(([type, count]) => {
          doc.text(`- ${type}: ${count}`);
        });
      }
      doc.moveDown(1);

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("Transiti per fascia oraria");
      doc.moveDown(0.5);

      doc.fontSize(11).font("Helvetica");

      if (stats.transits.bySlot.length === 0) {
        doc.text("Nessun dato disponibile.");
      } else {
        stats.transits.bySlot.forEach((s) => {
          doc.text(
            `- Fascia ${s.slot}: Totale ${s.total} (IN: ${s.in}, OUT: ${s.out})`
          );
        });
      }

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("Dettaglio transiti", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica");

      if (!stats.transits.list || stats.transits.list.length === 0) {
        doc.text("Nessun transito nel periodo.");
      } else {
        stats.transits.list.forEach((t: any) => {
          doc.text(
            `${t.date.toLocaleString("it-IT")} - veicolo: ${t.vehicleId} - tipo: ${t.type} - gate: ${t.gateId}`
          );
          doc.moveDown(0.2);

          if (doc.y > 750) {
            doc.addPage();
            doc.moveDown(0.5);
          }
        });
      }

            doc.end();
    });
  }
}
