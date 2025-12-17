// Mock delle chiavi JWT.
// Evita di leggere file reali durante i test.
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
// Nei test l’utente viene sempre autorizzato (operator e driver).
jest.mock("../../middlewares/RoleMiddleware", () => ({
  __esModule: true,
  RoleMiddleware: jest.fn().mockImplementation(() => ({
    isOperator: (_req: any, _res: any, next: any) => next(),
    isDriver: (_req: any, _res: any, next: any) => next(),
  })),
}));

// Mock del TokenMiddleware.
// Evita il consumo di crediti/token durante i test.
jest.mock("../../middlewares/TokenMiddleware", () => ({
  __esModule: true,
  consumeTokenCredit: (_req: any, _res: any, next: any) => next(),
}));

// Mock del GateService.
// Serve solo a simulare l’esistenza del gate.
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

// Mock del TransitService.
// Simula la creazione di un transito senza eseguire la logica reale.
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
  /**
   * Verifica che la rotta crei correttamente un transito
   * quando tutti i controlli sono superati.
   */
  it("crea un transito (mock)", async () => {
    const gateId = "40803563-cbff-4162-bcc2-ec175ed7b524";

    const res = await request(app)
      // Chiamata alla rotta di creazione transito da gate
      .post(`/transit/gate/${gateId}`)
      // Simula l’upload dell’immagine della targa
      .attach("file", Buffer.from("fake"), "plate.png");

    console.log(res.status, res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id", "transit-id");
  });
});