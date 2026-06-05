import mongoose from "mongoose";
const Schema = mongoose.Schema;

const user = new Schema({
    username: String,
    email: String,
    password: String
});

const tag = new Schema({
    name: String
});

const content = new Schema({
    title: String,
    link: String,
    tag: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
    userId: { type: mongoose.Types.ObjectId, ref: "User" }
});

export const UserModel = mongoose.model("User", user);
export const TagModel = mongoose.model("Tag", tag);
export const ContentModel = mongoose.model("Content", content);



