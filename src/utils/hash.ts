
import bcrypt from "bcrypt";

export async function HashedPassword(password: string) {

    return bcrypt.hash(password, 12)
};

export async function VerifyPassword(password: string, HashedPassword: string) {
    return bcrypt.compare(password, HashedPassword)
};