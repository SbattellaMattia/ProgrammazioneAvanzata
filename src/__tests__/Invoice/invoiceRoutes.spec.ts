jest.mock("../../secrets/keys");

/**
 * Mock AuthMiddleware: per ogni test imposto req.user dinamicamente.
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
 * ensureExists lo “bypassiamo” per questi test (non ci interessa davvero il DB).
 */
jest.mock("../../middlewares/EnsureExist", () => ({
  __esModule: true,
  ensureExists: () => (_req: any, _res: any, next: any) => next(),
}));

/**
 * Mock InvoiceService: lo controlliamo nei test.
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

  describe("GET /invoice/:id/pdf", () => {
    it("DRIVER può scaricare PDF (200, content-type pdf)", async () => {
      mockUser = { id: "driver-id", email: "d@test.com", role: Role.DRIVER };
      (InvoiceService.generateInvoicePdf as jest.Mock).mockResolvedValue(
        Buffer.from("FAKE_PDF")
      );

      const res = await request(app).get(`/invoice/${invoiceId}/pdf`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/pdf");
      expect(InvoiceService.generateInvoicePdf).toHaveBeenCalledWith(
        invoiceId,
        "driver-id"
      );
    });

    it("OPERATOR può scaricare PDF (200, content-type pdf)", async () => {
      mockUser = { id: "operator-id", email: "o@test.com", role: Role.OPERATOR};
      (InvoiceService.generateInvoicePdf as jest.Mock).mockResolvedValue(
        Buffer.from("FAKE_PDF")
      );

      const res = await request(app).get(`/invoice/${invoiceId}/pdf`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/pdf");
      expect(InvoiceService.generateInvoicePdf).toHaveBeenCalledWith(
        invoiceId,
        "operator-id"
      );
    });
});
