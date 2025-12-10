// src/middlewares/TokenMiddleware.ts
import { Request, Response, NextFunction } from "express";
import userDAO from "../dao/UserDAO";
import { UnauthorizedError, NotFoundError, InsufficientTokensError } from "../errors";

export const consumeTokenCredit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError("Utente non autenticato");
    }

    // Recupera l'utente dal database
    const user = await userDAO.findById(req.user.id);
    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    // Controlla credito token, se zero lancia errore
    if (user.tokens <= 0) {
      throw new InsufficientTokensError(user.tokens, 1);
    }

    // Scala SEMPRE 1 token
    await userDAO.decrementTokens(user.id, 1);
    console.log(`Token scalato → Utente: ${user.email} | Rimasti: ${user.tokens - 1}`);

    next();
  } catch (err) {
    next(err);
  }
};