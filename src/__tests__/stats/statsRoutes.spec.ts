// src/__tests__/stats/statsRoutes.spec.ts

// 🔐 mock chiavi JWT (evita fs.readFileSync delle key)
jest.mock("../../secrets/keys");

// 🔐 mock AuthMiddleware (mette req.user)
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

// 🔐 mock RoleMiddleware (operatore sempre ok)
jest.mock("../../middlewares/RoleMiddleware", () => ({
  __esModule: true,
  RoleMiddleware: jest.fn().mockImplementation(() => ({
    isOperator: (_req: any, _res: any, next: any) => next(),
  })),
}));

// 🔐 mock TokenMiddleware (non scala token nei test)
jest.mock("../../middlewares/TokenMiddleware", () => ({
  __esModule: true,
  consumeTokenCredit: (_req: any, _res: any, next: any) => next(),
}));

// 🅿️ mock ParkingService per ensureExists (route /stats/:id)
jest.mock("../../services/ParkingService", () => ({
  __esModule: true,
  default: {
    getById: jest.fn().mockResolvedValue({
      id: "parking-id",
      name: "Test Parking",
    }),
  },
}));

// 📊 mock StatsController (non testiamo la logica del service qui, solo la rotta)
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
  it("GET /stats → 200 + stats globali", async () => {
    const res = await request(app).get("/stats");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 100 });
  });

  it("GET /stats/:id → 200 + stats parcheggio", async () => {
    const parkingId = "40803563-cbff-4162-bcc2-ec175ed7b524";

    const res = await request(app).get(`/stats/${parkingId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ parkingId: "parking-id", total: 50 });
  });
});