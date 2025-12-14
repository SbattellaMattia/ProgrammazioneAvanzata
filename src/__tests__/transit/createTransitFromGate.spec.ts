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

// ✅ mock GateService per ensureExists
jest.mock("../../services/GateService", () => ({
  __esModule: true,
  default: {
    getById: jest.fn().mockResolvedValue({
      id: "40803563-cbff-4162-bcc2-ec175ed7b524",
      parkingId: "parking-id",
      type: "standard",      
      direction: "in",
    }),
  },
}));

// ✅ mock TransitService
jest.mock("../../services/TransitService", () => ({
  __esModule: true,
  default: {
    createFromGate: jest.fn().mockResolvedValue({
      id: "transit-id",
      type: "in",
    }),
  },
}));

import request from "supertest";
import app from "../../app";

describe("POST /transit/gate/:id", () => {
  it("crea un transito (mock)", async () => {
    const gateId = "40803563-cbff-4162-bcc2-ec175ed7b524";

    const res = await request(app)
      .post(`/transit/gate/${gateId}`) // ✅ backticks!
      .attach("file", Buffer.from("fake"), "plate.png");

    // utile se fallisce:
    console.log(res.status, res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id", "transit-id");
  });
});