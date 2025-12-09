// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';


export class AuthController {
  constructor(private authService: AuthService) {}


  /**
   * Login utente
   * Dati sono già validati dal middleware
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login effettuato con successo',
      data: result,
    });
  });

  /**
   * Logout utente
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logout effettuato con successo',
    });
  });

  /**
   * Refresh token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const newToken = await this.authService.refreshToken(req.user!.id);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: { token: newToken },
    });
  });
}
