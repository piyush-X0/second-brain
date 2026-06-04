import { z } from "zod";

export const userValidation = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email().min(4).max(30),
    password: z.string().min(8).max(30),
});

export const signinValidation = z.object({
    email: z.string().email().min(3).max(20),
    password: z.string().min(8).max(30)
})

export type SignupValidation = z.infer<typeof userValidation>;
export type SigninValidation = z.infer<typeof signinValidation>;
