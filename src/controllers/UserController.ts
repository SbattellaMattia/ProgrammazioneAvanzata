import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
  constructor(private userService: UserService) {}
}
