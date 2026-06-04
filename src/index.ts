import "dotenv/config";
import { connectDB } from "./utils/dbconfig";
import express from "express";
import { Request, Response } from "express"
import { UserModel } from "./db";
import { signinValidation, userValidation } from "./utils/validation";
import { HashedPassword, VerifyPassword } from "./utils/hash";
import { Success, Client, Server } from "./utils/status";
import { signtoken } from "./utils/jwt";

connectDB();

const app = express();
app.use(express.json());

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
            message: "Internal Server Error , try again later..."
        });
    }
})

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

    } catch (err: unknown) {
        res.status(Server.Internal_Server).json({ message: "Internal Server Error" })
    }

});
app.post("/api/v1/content", (req, res) => {

})
app.put("/api/v1/content", (req, res) => {

})

app.listen(3000);
