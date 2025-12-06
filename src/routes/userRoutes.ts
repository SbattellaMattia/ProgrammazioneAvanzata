import { NextFunction, Router, Request, Response } from "express";
import { UserDAO } from "../dao/UserDAO";


const router = Router();

const userDAO = new UserDAO();
//const userRepo = new UserRepository(userDAO);
//const userService = new UserService(userRepo);
//const userController = new UserController(userService);

let logUser= (req:Request, res:Response, next: NextFunction)=>{
    console.log("*****USER********", req.user);
    next();
}

//router.get("/users", userController.list);
//router.post("/users", [logUser, userController.create]);
//router.get("/users/:id", userController.get);
//router.delete("/users/:id", userController.delete);

export default router;
