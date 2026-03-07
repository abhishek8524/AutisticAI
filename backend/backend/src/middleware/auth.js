import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";

dotenv.config();

// JWT validation middleware — rejects unauthenticated requests
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE || "https://sensorysafe-api",
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: "RS256",
});

export default checkJwt;
