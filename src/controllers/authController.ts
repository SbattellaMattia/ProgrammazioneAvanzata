import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';

export class AuthController {
  constructor(private authService: AuthService) {}
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login effettuato con successo',
      data: result,
    });
  });
}
