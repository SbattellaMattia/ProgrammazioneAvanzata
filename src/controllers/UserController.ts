import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
  constructor(private userService: UserService) {}

  list = async (req: Request, res: Response) => {
    const users = await this.userService.listUsers();
    res.json(users);
  };

  /*create = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const user = await this.userService.createUser(name, email);
    res.status(201).json(user);
  };*/

  get = async (req: Request, res: Response) => {
    const user = await this.userService.getUserById(req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ message: "User not found" });
  };

  /*delete = async (req: Request, res: Response) => {
    await this.userService.deleteUser(req.params.id);
    res.status(204).send();
  }; */
}
