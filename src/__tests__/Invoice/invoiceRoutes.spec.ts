jest.mock("../../secrets/keys");

/**
 * Mock dell’AuthMiddleware.
 * L’utente viene impostato dinamicamente nei test
 * per simulare ruoli diversi (DRIVER / OPERATOR).
 */
let mockUser: any = { id: "driver-id", email: "d@test.com", role: "DRIVER" };

jest.mock("../../middlewares/AuthMiddleware", () => ({
  __esModule: true,
  AuthMiddleware: jest.fn().mockImplementation(() => ({
    authenticateToken: (req: any, _res: any, next: any) => {
      req.user = mockUser;
      next();
    },
  })),
}));

/**
 * Mock del TokenMiddleware.
 * Serve a evitare accessi al database durante i test.
 */
jest.mock("../../middlewares/TokenMiddleware", () => ({
  __esModule: true,
  consumeTokenCredit: (_req: any, _res: any, next: any) => next(),
}));

/**
 * Mock di ensureExists.
 * In questi test non ci interessa verificare l’esistenza reale
 * delle risorse nel database.
 */
jest.mock("../../middlewares/EnsureExist", () => ({
  __esModule: true,
  ensureExists: () => (_req: any, _res: any, next: any) => next(),
}));

/**
 * Mock dell’InvoiceService.
 * La logica reale non viene eseguita, controlliamo solo che venga chiamato.
 */
jest.mock("../../services/InvoiceService", () => ({
  __esModule: true,
  default: {
    pay: jest.fn(),
    generateInvoicePdf: jest.fn(),
  },
}));

import request from "supertest";
import app from "../../app";
import InvoiceService from "../../services/InvoiceService";
import { Role } from "../../enum/Role";

const invoiceId = "11111111-1111-1111-1111-111111111111";

describe("GET /invoice/:id/paymentQr", () => {
  /**
   * Verifica che un DRIVER possa scaricare il PDF di pagamento.
   */
  it("DRIVER può scaricare PDF (200, content-type pdf)", async () => {
    mockUser = { id: "driver-id", email: "d@test.com", role: Role.DRIVER };

    (InvoiceService.generateInvoicePdf as jest.Mock).mockResolvedValue(
      Buffer.from("FAKE_PDF")
    );

    const res = await request(app).get(
      `/invoice/${invoiceId}/paymentQr`
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(InvoiceService.generateInvoicePdf).toHaveBeenCalledWith(
      invoiceId,
      "driver-id"
    );
  });

  /**
   * Verifica che anche un OPERATOR possa scaricare il PDF di pagamento.
   */
  it("OPERATOR può scaricare PDF (200, content-type pdf)", async () => {
    mockUser = {
      id: "operator-id",
      email: "o@test.com",
      role: Role.OPERATOR,
    };

    (InvoiceService.generateInvoicePdf as jest.Mock).mockResolvedValue(
      Buffer.from("FAKE_PDF")
    );

    const res = await request(app).get(
      `/invoice/${invoiceId}/paymentQr`
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(InvoiceService.generateInvoicePdf).toHaveBeenCalledWith(
      invoiceId,
      "operator-id"
    );
  });
});