import "dotenv/config";
import { connectDB } from "./utils/dbconfig";
import express from "express";
import { Request, Response } from "express"
import { UserModel, ContentModel } from "./db";
import { signinValidation, userValidation } from "./utils/validation";
import { HashedPassword, VerifyPassword } from "./utils/hash";
import { Success, Client, Server } from "./utils/status";
import { signtoken } from "./utils/jwt";
import { middleware } from "./utils/middleware";
connectDB();

const app = express();
app.use(express.json());

interface UserRequest extends Request {
    userId?: string
}

app.post("/api/v1/signup", async (req: Request, res: Response) => {
    try {

        const parsed_data = userValidation.safeParse(req.body);

        if (!parsed_data.success) {
            res.status(Client.bad_req).json({
                message: "Incorrect format",
                error: parsed_data.error
            })
            return
        }
        const { username, password, email } = parsed_data.data;

        const existingUser = await UserModel.findOne({
            email: email
        })
        if (existingUser) {
            res.status(Client.Conflict).json({ message: "User already exists" })
            return
        }
        const hashedpass = await HashedPassword(password);

        await UserModel.create({
            username,
            password: hashedpass,
            email
        })
        res.status(Success.Created).json({
            message: "signup successfully"
        })
    } catch (err: unknown) {
        console.log(err)
        res.status(Server.Internal_Server).json({
            message: "Internal Server Error "
        });
    }
});
app.post("/api/v1/signin", async (req: Request, res: Response) => {
    try {
        const parsed_data = signinValidation.safeParse(req.body);

        if (!parsed_data.success) {
            res.status(Client.bad_req).json({
                message: "Incorrect format",
                error: parsed_data.error
            });
            return
        }
        const { email, password } = parsed_data.data;

        const existingUser = await UserModel.findOne({ email: email });
        if (!existingUser) {
            res.status(Client.Not_found).json({ message: "User not found" });
            return
        }
        const pass_compare = await VerifyPassword(password, existingUser.password!);
        if (!pass_compare) {
            res.status(Client.unathorized).json({ message: "Invalid Credentials" });
            return
        }
        const token = signtoken(existingUser._id.toString());
        res.json({ token: token })
        console.log(token)

    } catch (err: unknown) {
        res.status(Server.Internal_Server).json({ message: "Internal Server Error" })
    }

});
app.post("/api/v1/content", middleware, async (req: UserRequest, res: Response) => {
    const { link, title, tag } = req.body;
    try {
        if (!req.userId) {
            res.status(Client.unathorized).json({ message: "Unauthorized" });
            return
        }
        await ContentModel.create({
            link,
            title,
            tag: tag ?? [],
            userId: req.userId
        });
        res.status(Success.Created).json({ message: "Content Created" });
        return
    } catch (err: unknown) {
        console.log(err)
        res.status(Server.Internal_Server).json({ message: "Internal Server Error " })
    }
});
app.get("/api/v1/content", (req, res) => {
});
app.listen(3000);