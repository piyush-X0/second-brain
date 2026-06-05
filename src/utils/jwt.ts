import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error("JWT is not set in .env ");

export const signtoken = (user_id: string) => {
    return jwt.sign({ id: user_id }, JWT_SECRET, { expiresIn: "7d" });
}
