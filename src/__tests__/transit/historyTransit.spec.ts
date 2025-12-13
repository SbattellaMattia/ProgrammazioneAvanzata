jest.mock("../../secrets/keys");

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

jest.mock("../../middlewares/RoleMiddleware", () => ({
  __esModule: true,
  RoleMiddleware: jest.fn().mockImplementation(() => ({
    isOperator: (_req: any, _res: any, next: any) => next(),
    isDriver: (_req: any, _res: any, next: any) => next(),
  })),
}));

jest.mock("../../middlewares/TokenMiddleware", () => ({
  __esModule: true,
  consumeTokenCredit: (_req: any, _res: any, next: any) => next(),
}));

// 🔥 mock del SERVICE
jest.mock("../../services/TransitService", () => ({
  __esModule: true,
  default: {
    getTransitHistory: jest.fn().mockResolvedValue([]),
  },
}));

import request from "supertest";
import app from "../../app";

describe("GET /transit/history", () => {
  it("risponde 200 con auth mockata", async () => {
    const res = await request(app).get("/transit/history");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});