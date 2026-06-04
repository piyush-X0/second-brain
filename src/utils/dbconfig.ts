
import mongoose from "mongoose";

export const connectDB = async () => {

    try {
        await mongoose.connect(process.env.DATABASE_URL!);
        console.log("Database Connected !")
    } catch (err) {
        console.log("DB connection failed : ", err);
        process.exit(1);
    }
}