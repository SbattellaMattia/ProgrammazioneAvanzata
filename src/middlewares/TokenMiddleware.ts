// src/middlewares/TokenMiddleware.ts
import { Request, Response, NextFunction } from "express";
import userDAO from "../dao/UserDAO";
import { UnauthorizedError, NotFoundError, InsufficientTokensError } from "../errors";

/**
  * Middleware per la gestione del consumo dei token degli utenti.
  * Scala un token ad ogni richiesta protetta.
  * @param req - La richiesta HTTP.
  * @param res - La risposta HTTP.
  * @param next - La funzione per passare al middleware successivo.
  * @throws UnauthorizedError Se l'utente non è autenticato.
  * @throws NotFoundError Se l'utente non viene trovato nel database.
  * @throws InsufficientTokensError Se l'utente non ha token sufficienti.
  */
export const consumeTokenCredit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError("Utente non autenticato");
    }

    // Recupera l'utente dal database
    const user = await userDAO.findById(req.user.id);
    if (!user) {
      throw new NotFoundError("Utente",req.user.id);
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