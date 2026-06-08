import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    statusCode: 429,
    keyGenerator: (req: any) => `${ipKeyGenerator(req)}_${req.path}`,
    message: { error: "Too many requests, try again later." }
});