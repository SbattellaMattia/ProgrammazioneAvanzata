import express from "express";
import userRoutes from "./routes/userRoutes";
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";
import { UserPayload } from "./@types/CustomUser";
import {StatusCodes} from 'http-status-codes'

/*interface RequestUser extends express.Request{
  user:string | jwt.JwtPayload;
}*/


/*
MODIFICARE: spostare la logica nella parte opportuna. 
In questo file lasciare solo la parte di matching tra rotta (stringa) e le routes  
*/


interface RequestRole extends express.Request{
  role?:string;
}
const JWT_SECRET = process.env.JWT_SECRET || "ciao";
const logError = (err:Error, req:express.Request, res:Response, next:NextFunction):void=>{
  console.log("ahi ahi",err);
  next(err);
}

const logRequest = (req:Request, res:Response, next:NextFunction)=>{
  console.log(req.headers);
  next();
}

const verifyJWt = (req: Request, res:express.Response, next:NextFunction)=>{    
  try{
    if(req.headers.authorization){
      const jwtToken = req.headers.authorization?.split(" ");
      
      if (jwtToken.length === 2 && jwtToken[0] === "Bearer"){
        let out = jwt.verify(jwtToken[1] || "", JWT_SECRET );
        console.log(out, jwtToken[1]);
        // req.user = <UserPayload>JSON.parse(<string>out)
        req.user = <UserPayload>out;
        console.log("ciao USER",req.user);                
      }
      else{
        throw new Error("Ahi ahi...invalid header...");
      }
    }
    else 
      throw new Error("Ahi ahi...bearer not found...");
  }catch (err){
    next(err);
    //res.status(StatusCodes.UNAUTHORIZED).send({})
  }
  next();
}

const errorHandler = (err:Error, req:express.Request, res:Response, next:NextFunction):void=>{
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
}
const app = express();
const port = 3000;

app.use(express.json());
app.use(verifyJWt);
//app.use(logRequest);
app.use("/api", userRoutes);
app.use((req, res) => {  
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      name: "NotFoundError",
      message: `Route ${req.originalUrl} not found`
    }
  });
});
app.use(logError);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;