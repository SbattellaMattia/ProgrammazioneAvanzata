import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware";
import { UnauthorizedError, InvalidTokenError } from "../../errors"; // <-- come nel tuo progetto
import { Role } from "../../enum/Role";
describe("AuthMiddleware.authenticateToken", () => {
  let mockAuthService: any;
  let middleware: AuthMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockAuthService = { verifyToken: jest.fn() };
    middleware = new AuthMiddleware(mockAuthService);

    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it("next(UnauthorizedError) se manca Authorization", () => {
    middleware.authenticateToken(req as Request, res as Response, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
  });

  it("next(UnauthorizedError) se Authorization non è Bearer", () => {
    req.headers = { authorization: "Token xxx" } as any;

    middleware.authenticateToken(req as Request, res as Response, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
  });

  it("setta req.user e chiama next() se token valido", () => {
    req.headers = { authorization: "Bearer ok.token" } as any;

    const fakeUser = { id: "u1", email: "a@a.it", role: Role.OPERATOR};
    mockAuthService.verifyToken.mockReturnValue(fakeUser);

    middleware.authenticateToken(req as Request, res as Response, next);

    expect((req as any).user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });

  it("next(InvalidTokenError) se verifyToken lancia TokenExpiredError", () => {
    req.headers = { authorization: "Bearer expired.token" } as any;

    mockAuthService.verifyToken.mockImplementation(() => {
      throw new jwt.TokenExpiredError("expired", new Date());
    });

    middleware.authenticateToken(req as Request, res as Response, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(InvalidTokenError);
  });

  it("next(InvalidTokenError) se verifyToken lancia JsonWebTokenError", () => {
    req.headers = { authorization: "Bearer bad.token" } as any;

    mockAuthService.verifyToken.mockImplementation(() => {
      throw new jwt.JsonWebTokenError("bad");
    });

    middleware.authenticateToken(req as Request, res as Response, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(InvalidTokenError);
  });
});