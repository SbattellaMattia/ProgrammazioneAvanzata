// src/@types/express/index.d.ts

import {UserPayload} from "../CustomUser"

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      role?: string;
    }
  }
}