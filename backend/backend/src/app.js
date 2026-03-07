import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import locationsRoutes from "./routes/locations.js";
import reviewsRoutes from "./routes/reviews.js";
import profilesRoutes from "./routes/profiles.js";
import rankingsRoutes from "./routes/rankings.js";
import aiRoutes from "./routes/ai.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
    res.json({ status: 'SensorySafe backend running' });
});

app.use("/api/locations", locationsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/rankings", rankingsRoutes);
app.use("/api/ai", aiRoutes);

export default app;