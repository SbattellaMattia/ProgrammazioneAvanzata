import { UserRepository } from "../repositories/UserRepository";
import { User } from "../models/User";
import { randomUUID } from "crypto";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async listUsers(): Promise<User[]> {
    return this.userRepo.getAllUsers();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.userRepo.getUserById(id);
  }

  async createUser(name: string, email: string): Promise<User> {
    const user: User = {
      id: randomUUID(),
      name,
      email
    };
    await this.userRepo.createUser(user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepo.removeUser(id);
  }
}
