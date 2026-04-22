import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import locationsRoutes from "./routes/locations.js";
import reviewsRoutes from "./routes/reviews.js";
import profilesRoutes from "./routes/profiles.js";
import rankingsRoutes from "./routes/rankings.js";
import aiRoutes from "./routes/ai.js";
import uploadRoutes from "./routes/upload.js";
import savedPlacesRouter from "./routes/savedPlaces.js";
import discoverRouter from "./routes/discover.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser clients and same-origin requests with no Origin header.
            if (!origin) return callback(null, true);
            if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: 'SensorySafe backend running' });
});

app.use("/locations", locationsRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/profiles", profilesRoutes);
app.use("/rankings", rankingsRoutes);
app.use("/ai", aiRoutes);
app.use("/upload", uploadRoutes);
app.use("/saved-places", savedPlacesRouter);
app.use("/discover", discoverRouter);

export default app;