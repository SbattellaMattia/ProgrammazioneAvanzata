import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler';
import InvoiceService from '../services/InvoiceService';
import { StatusCodes } from 'http-status-codes';
import { InvoiceFilterDTO } from '../dto/InvoiceDTO';

class InvoiceController {

  /**
   * GET /api/invoices
   * Recupera tutte le fatture
   */
  /*getAll = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const parkings = await InvoiceService.getAll(user.id, user.role);
    return res.status(StatusCodes.OK).json(parkings);
  });*/

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await InvoiceService.getById(id);
    return res.status(StatusCodes.OK).json(invoice);
  });


  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { from, to, status } = req.query;
    const user = (req as any).user;

    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;

    const additionalWhere: any = {};
    if (status) {
      additionalWhere.status = (status as string);
    }

    const data = await InvoiceService.getAll(user.id, user.role, fromDate, toDate, additionalWhere);
    return res.json(data);
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

  pay = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await InvoiceService.pay(id);
  });
}

export default new InvoiceController();
