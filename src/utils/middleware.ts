import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Client, Server } from "./status";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT is not set in .env ");

interface UserRequest extends Request {
    userId?: string;
}
export const middleware = (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            res.status(Client.unauthorized).json({ message: "No token provided" });
            return
        }
        const decoded = jwt.verify(token as string, JWT_SECRET);
        if (typeof decoded === "string" || !decoded?.id) {
            res.status(Client.Forbidden).json({ message: "You are not logged in" });
            return
        }
        req.userId = decoded.id;
        next();
    } catch (err) {
        console.log("Middleware Error:", err);
        res.status(Client.unauthorized).json({ message: "Invalid or expired token" })
    }
}