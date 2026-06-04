import mongoose from "mongoose";
const Schema = mongoose.Schema;

const user = new Schema({
    username: { type: String, unique: true },
    email: String,
    password: String
});


export const UserModel = mongoose.model("users", user);




