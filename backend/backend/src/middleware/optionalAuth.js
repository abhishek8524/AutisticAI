import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";

dotenv.config();

// Optional auth — allows unauthenticated requests but attaches user info if token present
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // No token — continue without auth
        return next();
    }

    // Token present — validate it
    const checkJwt = auth({
        audience: process.env.AUTH0_AUDIENCE || "https://sensorysafe-api",
        issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
        tokenSigningAlg: "RS256",
    });

    checkJwt(req, res, (err) => {
        if (err) {
            // Token invalid — still allow request but without auth
            console.warn("[optionalAuth] Invalid token, continuing without auth:", err.message);
            return next();
        }
        next();
    });
};

export default optionalAuth;
