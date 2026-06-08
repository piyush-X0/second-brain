import "dotenv/config";
import express from "express";
import { Request, Response } from "express"
import { UserModel, ContentModel } from "./db";
import { signinValidation, userValidation } from "./utils/validation";
import { HashedPassword, VerifyPassword } from "./utils/hash";
import { Success, Client, Server } from "./utils/status";
import { signtoken } from "./utils/jwt";
import { middleware } from "./utils/middleware";
import { limiter } from "./utils/ratelimiter";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", limiter, async (req: Request, res: Response) => {
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
app.post("/api/v1/signin", limiter, async (req: Request, res: Response) => {
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
            res.status(Client.unauthorized).json({ message: "Invalid Credentials" });
            return
        }
        const token = signtoken(existingUser._id.toString());
        res.json({ token })

    } catch (err: unknown) {
        res.status(Server.Internal_Server).json({ message: "Internal Server Error" })
    }

});
app.post("/api/v1/content", limiter, middleware, async (req: Request, res: Response) => {
    const { link, title, tag } = req.body;
    try {
        if (!req.userId) {
            res.status(Client.unauthorized).json({ message: "Unauthorized" });
            return
        }
        await ContentModel.create({
            link,
            title,
            tag: tag ?? [],
            userId: req.userId
        });
        res.status(Success.Created).json({ message: "Content Created" });
    } catch (err) {
        console.log(err)
        res.status(Server.Internal_Server).json({ message: "Internal Server Error " })
    }
});
app.get("/api/v1/content", limiter, middleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(Client.unauthorized).json({ message: "Unauthorized" });
            return
        }
        const content = await ContentModel.find({
            userId: userId
        }).populate("userId", "username");
        res.status(Success.OK).json({ content });
    } catch (err) {
        console.log(err)
        res.status(Server.Internal_Server).json({ message: "Internal Server Error" })
    }
});
app.delete("/api/v1/content", middleware, async (req: Request, res: Response) => {
    try {
        const contentId = req.body.contentId;
        if (!contentId) {
            res.status(Client.bad_req).json({ message: "contentId is required" });
            return
        }
        if (!req.userId) {
            res.status(Client.unauthorized).json({ message: "Unauthorized" });
            return
        }
        await ContentModel.deleteMany({
            _id: contentId,
            userId: req.userId,
        });
        res.status(Success.OK).json({ message: "Deleted" });
    } catch (err) {
        console.log(err)
        res.status(Server.Internal_Server).json({ message: "Internal Server Error" });
    }
});
app.listen(process.env.PORT || 3000);