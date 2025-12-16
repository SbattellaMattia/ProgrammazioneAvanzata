import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler';
import InvoiceService from '../services/InvoiceService';
import { StatusCodes } from 'http-status-codes';
import { InvoiceFilterDTO } from '../dto/InvoiceDTO';

/**
 * Controller per la gestione delle fatture.
 * Gestisce le richieste correlate alle fatture, come il recupero,
 * il download del bollettino PDF e il pagamento delle fatture.
 * @class InvoiceController
 * @description Questo controller gestisce le richieste HTTP relative alle fatture.
 * Include metodi per ottenere le fatture, scaricare i bollettini PDF e pagare le fatture.
 */
class InvoiceController {

  /** Ottiene una fattura per ID.
   * @route GET /invoice/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID della fattura.
   * @param {Response} res - La risposta HTTP con la fattura richiesta.
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;
    const invoice = await InvoiceService.getByUserId(id, user.id);
    return res.status(StatusCodes.OK).json(invoice);
  });

  /** Ottiene tutte le fatture con filtri opzionali.
   * @route GET /invoice
   * @param {Request} req - La richiesta HTTP con i parametri di filtro opzionali.
   * @param {Response} res - La risposta HTTP con l'elenco delle fatture.
   */
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

  /** Ottiene e scarica il bollettino PDF di una fattura.
   * @route GET /invoice/:id/download
   * @param {Request} req - La richiesta HTTP contenente l'ID della fattura.
   * @param {Response} res - La risposta HTTP con il bollettino PDF.
   */
  downloadPayment = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;

    const pdfBuffer = await InvoiceService.generateInvoicePdf(id, user.id);

    // 2. Imposta Headers per il download
    res.setHeader('Content-Type', 'application/pdf');
    // 'attachment' forza il download. 
    res.setHeader('Content-Disposition', `attachment; filename=bollettino_${id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // 3. Invia il buffer
    return res.send(pdfBuffer);
  });

  /** Paga una fattura.
   * @route POST /invoice/:id/pay
   * @param {Request} req - La richiesta HTTP contenente l'ID della fattura.
   * @param {Response} res - La risposta HTTP con il messaggio di conferma del pagamento.
   */
  pay = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;
    await InvoiceService.pay(id, user.id);
    return res.status(200).json({ success: true, message: "Fattura pagata" });
  });
}

export default new InvoiceController();
