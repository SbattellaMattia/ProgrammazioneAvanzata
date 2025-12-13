import { Request, Response, NextFunction } from "express";
import { RoleMiddleware } from "../../middlewares/RoleMiddleware";
import { UnauthorizedError, ForbiddenError } from "../../errors";
import { Role } from "../../enum/Role";

describe("RoleMiddleware", () => {
  let middleware: RoleMiddleware;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new RoleMiddleware({} as any); // authService non usato qui
    next = jest.fn();
  });

  it("isOperator -> Unauthorized se manca req.user", () => {
    const req = {} as Request;
    middleware.isOperator(req, {} as Response, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
  });

  it("isOperator -> Forbidden se user non è OPERATOR", () => {
    const req = { user: { role: Role.DRIVER } } as any;
    middleware.isOperator(req, {} as Response, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(ForbiddenError);
  });

  it("isOperator -> next() se user è OPERATOR", () => {
    const req = { user: { role: Role.OPERATOR } } as any;
    middleware.isOperator(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("isDriver -> Forbidden se user non è DRIVER", () => {
    const req = { user: { role: Role.OPERATOR } } as any;
    middleware.isDriver(req, {} as Response, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(ForbiddenError);
  });
});