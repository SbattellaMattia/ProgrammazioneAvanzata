// Mock delle chiavi JWT.
// Evita l’uso di file reali durante i test.
jest.mock("../../secrets/keys");

// Mock dell’AuthMiddleware.
// Simula un utente autenticato impostando req.user.
jest.mock("../../middlewares/AuthMiddleware", () => ({
  __esModule: true,
  AuthMiddleware: jest.fn().mockImplementation(() => ({
    authenticateToken: (req: any, _res: any, next: any) => {
      req.user = {
        id: "test-user-id",
        email: "test@email.com",
        role: "OPERATOR",
      };
      next();
    },
  })),
}));

// Mock del RoleMiddleware.
// Nei test l’utente è sempre autorizzato.
jest.mock("../../middlewares/RoleMiddleware", () => ({
  __esModule: true,
  RoleMiddleware: jest.fn().mockImplementation(() => ({
    isOperator: (_req: any, _res: any, next: any) => next(),
    isDriver: (_req: any, _res: any, next: any) => next(),
  })),
}));

// Mock del TokenMiddleware.
// Evita il consumo di token o crediti durante i test.
jest.mock("../../middlewares/TokenMiddleware", () => ({
  __esModule: true,
  consumeTokenCredit: (_req: any, _res: any, next: any) => next(),
}));

// Mock del TransitService.
// Non testiamo la logica del service, ma solo la rotta.
jest.mock("../../services/TransitService", () => ({
  __esModule: true,
  default: {
    getTransitHistory: jest.fn().mockResolvedValue([]),
  },
}));

import request from "supertest";
import app from "../../app";

describe("GET /transit/history", () => {
  /**
   * Verifica che la rotta risponda correttamente
   * quando l’utente è autenticato e autorizzato.
   */
  it("risponde 200 con auth mockata", async () => {
    const res = await request(app).get("/transit/history");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});