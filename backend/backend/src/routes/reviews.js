import express from "express";
import prisma from "../lib/prisma.js";
import checkJwt from "../middleware/auth.js";

const router = express.Router();

// GET /api/reviews/:locationId — Get all reviews for a location
router.get("/:locationId", async (req, res) => {
    try {
        const { locationId } = req.params;

        const reviews = await prisma.review.findMany({
            where: { locationId },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const formatted = reviews.map((r) => ({
            id: r.id,
            user: r.user?.username || r.user?.email || "Anonymous",
            bodyText: r.bodyText,
            rating: r.rating,
            noiseLevel: r.noiseLevel,
            lightingLevel: r.lightingLevel,
            crowdLevel: r.crowdLevel,
            aiSentiment: r.aiSentiment,
            aiTags: r.aiTags ? r.aiTags.split(",") : [],
            createdAt: r.createdAt,
        }));

        res.json({ reviews: formatted });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// POST /api/reviews — Submit a new review (requires auth)
router.post("/", checkJwt, async (req, res) => {
    try {
        const auth0Id = req.auth?.payload?.sub;
        if (!auth0Id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Find or create user
        let user = await prisma.user.findUnique({ where: { auth0Id } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    auth0Id,
                    email: req.auth?.payload?.email || `${auth0Id}@auth0.user`,
                },
            });
        }

        const { locationId, bodyText, rating, noiseLevel, lightingLevel, crowdLevel } = req.body;

        if (!locationId || !bodyText) {
            return res.status(400).json({ error: "locationId and bodyText are required" });
        }

        const review = await prisma.review.create({
            data: {
                userId: user.id,
                locationId,
                bodyText,
                rating: rating || 5,
                noiseLevel: noiseLevel || null,
                lightingLevel: lightingLevel || null,
                crowdLevel: crowdLevel || null,
            },
        });

        // Recalculate sensory scores for the location
        const allReviews = await prisma.review.findMany({
            where: { locationId },
        });

        const count = allReviews.length;
        const avg = (field) => {
            const values = allReviews.filter((r) => r[field] != null).map((r) => r[field]);
            return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        };

        const noiseAvg = avg("noiseLevel");
        const lightingAvg = avg("lightingLevel");
        const crowdAvg = avg("crowdLevel");
        // Comfort = inverse of average sensory intensity
        const comfortAvg = Math.max(0, 10 - (noiseAvg + crowdAvg) / 2);

        await prisma.sensoryScore.upsert({
            where: { locationId },
            create: {
                locationId,
                noiseScore: noiseAvg,
                lightingScore: lightingAvg,
                crowdScore: crowdAvg,
                comfortScore: comfortAvg,
                reviewCount: count,
            },
            update: {
                noiseScore: noiseAvg,
                lightingScore: lightingAvg,
                crowdScore: crowdAvg,
                comfortScore: comfortAvg,
                reviewCount: count,
            },
        });

        res.status(201).json({ message: "Review submitted", review });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ error: "Failed to submit review" });
    }
});

export default router;