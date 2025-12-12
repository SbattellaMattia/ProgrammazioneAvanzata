// src/middlewares/validate.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../errors';

/**
 * Middleware generico per validazione con Zod
 * 
 * @param schema - Schema Zod per la validazione
 * @param property - Parte della request da validare ('body' | 'query' | 'params')
 * 
 * @example
 * router.post('/register', validate(registerSchema, 'body'), authController.register);
 */
export const validate = <T extends z.ZodTypeAny>(
  schema: T,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req[property]);
      req[property] = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatta gli errori Zod
        const errors = error.errors.reduce((acc, curr) => {
          acc[curr.path.join('.')] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        
        throw new ValidationError('Errore di validazione, parametro\\i ' + Object.keys(errors).join(', ') + (Object.keys(errors).length==1 ? ' non valido' : ' non validi'+ error.message));
      }
      throw error;
    }
  };
};
