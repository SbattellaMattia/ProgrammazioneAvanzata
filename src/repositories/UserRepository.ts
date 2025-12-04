/*import { UserDAO } from "../dao/UserDao";
import { User } from "../models/User";

export class UserRepository {
  constructor(private userDAO: UserDAO) {}

  getAllUsers(): Promise<User[]> {
    return this.userDAO.findAll();
  }

  getUserById(id: string): Promise<User | undefined> {
    return this.userDAO.findById(id);
  }

  createUser(user: User): Promise<void> {
    return this.userDAO.save(user);
  }

  removeUser(id: string): Promise<void> {
    return this.userDAO.delete(id);
  }
}*/
