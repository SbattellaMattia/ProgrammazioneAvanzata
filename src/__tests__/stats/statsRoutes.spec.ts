// Mock delle chiavi JWT.
// Serve a evitare l’accesso al filesystem durante i test.
jest.mock("../../secrets/keys");

// Mock dell’AuthMiddleware.
// Simula un utente autenticato e inserisce req.user.
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
// Nei test l’utente viene sempre considerato autorizzato.
jest.mock("../../middlewares/RoleMiddleware", () => ({
  __esModule: true,
  RoleMiddleware: jest.fn().mockImplementation(() => ({
    isOperator: (_req: any, _res: any, next: any) => next(),
  })),
}));

// Mock del TokenMiddleware.
// Evita il consumo di token durante l’esecuzione dei test.
jest.mock("../../middlewares/TokenMiddleware", () => ({
  __esModule: true,
  consumeTokenCredit: (_req: any, _res: any, next: any) => next(),
}));

// Mock del ParkingService.
// Serve solo a verificare che il parcheggio esista nella rotta /stats/:id.
jest.mock("../../services/ParkingService", () => ({
  __esModule: true,
  default: {
    getById: jest.fn().mockResolvedValue({
      id: "parking-id",
      name: "Test Parking",
    }),
  },
}));

// Mock dello StatsController.
jest.mock("../../controllers/StatsController", () => ({
  __esModule: true,
  default: {
    getGlobalStats: jest.fn((_req: any, res: any) =>
      res.status(200).json({ total: 100 })
    ),
    getParkingStats: jest.fn((_req: any, res: any) =>
      res.status(200).json({ parkingId: "parking-id", total: 50 })
    ),
  },
}));

import request from "supertest";
import app from "../../app";

describe("STATS routes", () => {
  /**
   * Verifica che la rotta /stats risponda correttamente
   * quando l’utente è autenticato e autorizzato.
   */
  it("GET /stats → 200 + stats globali", async () => {
    const res = await request(app).get("/stats");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 100 });
  });

  /**
   * Verifica che la rotta /stats/:id risponda correttamente
   * per un parcheggio valido.
   */
  it("GET /stats/:id → 200 + stats parcheggio", async () => {
    const parkingId = "40803563-cbff-4162-bcc2-ec175ed7b524";

    const res = await request(app).get(`/stats/${parkingId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ parkingId: "parking-id", total: 50 });
  });
});