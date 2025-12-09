import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler';
import InvoiceService from '../services/InvoiceService';
import { StatusCodes } from 'http-status-codes';

class InvoiceController {

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const parkings = await InvoiceService.getAll();
        return res.status(StatusCodes.OK).json(parkings);
      });
  /**
   * GET /api/invoices/:id/pdf
   * Scarica il bollettino PDF con QR Code
   */
  downloadPayment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // 1. Chiamata al Service (Tutta la logica è lì)
    const pdfBuffer = await InvoiceService.generateInvoicePdf(id);

    // 2. Imposta Headers per il download
    res.setHeader('Content-Type', 'application/pdf');
    // 'attachment' forza il download. Usa 'inline' se vuoi vederlo nel browser.
    res.setHeader('Content-Disposition', `attachment; filename=bollettino_${id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // 3. Invia il buffer
    return res.send(pdfBuffer);
  });
}

export default new InvoiceController();
