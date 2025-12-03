import { User } from "../models/User";

export class UserDAO {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(user => user.id !== id);
  }
}
