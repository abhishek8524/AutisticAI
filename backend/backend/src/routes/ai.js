import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// GET /api/ai/:locationId — Aggregated AI insights for a location
router.get("/:locationId", async (req, res) => {
    try {
        const { locationId } = req.params;

        // Get all reviews with AI data for this location
        const reviews = await prisma.review.findMany({
            where: { locationId },
            select: {
                aiNoiseScore: true,
                aiLightingScore: true,
                aiCrowdScore: true,
                aiSentiment: true,
                aiTags: true,
                bodyText: true,
            },
        });

        if (reviews.length === 0) {
            return res.json({
                summary: "No reviews yet for this location. Be the first to share your experience!",
                sentiments: [],
                tags: [],
                reviewCount: 0,
            });
        }

        // Aggregate AI data
        const sentiments = reviews
            .filter((r) => r.aiSentiment)
            .map((r) => r.aiSentiment);

        const allTags = reviews.flatMap((r) => (r.aiTags ? r.aiTags.split(",") : []));
        const tagCounts = allTags.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));

        // Generate summary
        const positiveCount = sentiments.filter((s) => s === "positive").length;
        const negativeCount = sentiments.filter((s) => s === "negative").length;
        const neutralCount = sentiments.filter((s) => s === "neutral").length;

        let summaryText = `Based on ${reviews.length} review(s): `;
        if (positiveCount > negativeCount) {
            summaryText += "Overall positive sensory experience. ";
        } else if (negativeCount > positiveCount) {
            summaryText += "Some sensory challenges reported. ";
        } else {
            summaryText += "Mixed sensory experiences reported. ";
        }

        if (topTags.length > 0) {
            summaryText += `Common themes: ${topTags.slice(0, 3).map((t) => t.tag).join(", ")}.`;
        }

        res.json({
            summary: summaryText,
            sentiments: { positive: positiveCount, negative: negativeCount, neutral: neutralCount },
            tags: topTags,
            reviewCount: reviews.length,
        });
    } catch (error) {
        console.error("Error fetching AI insights:", error);
        res.status(500).json({ error: "Failed to fetch AI insights" });
    }
});

// POST /api/ai/analyze — Analyze review text (mock/placeholder)
router.post("/analyze", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Review text is required" });
        }

        // Mock AI analysis — replace with real Gemini API later
        const textLower = text.toLowerCase();

        const noiseKeywords = ["loud", "noise", "noisy", "quiet", "silent", "sound", "music", "blaring"];
        const lightKeywords = ["bright", "dark", "dim", "lighting", "fluorescent", "natural light", "glare"];
        const crowdKeywords = ["crowded", "busy", "packed", "empty", "spacious", "few people", "quiet"];

        const hasNoise = noiseKeywords.some((k) => textLower.includes(k));
        const hasLight = lightKeywords.some((k) => textLower.includes(k));
        const hasCrowd = crowdKeywords.some((k) => textLower.includes(k));

        const tags = [];
        if (hasNoise) tags.push("noise-related");
        if (hasLight) tags.push("lighting-related");
        if (hasCrowd) tags.push("crowd-related");

        // Simple sentiment
        const positiveWords = ["calm", "quiet", "peaceful", "comfortable", "cozy", "pleasant", "nice", "good", "great", "love"];
        const negativeWords = ["loud", "overwhelming", "bright", "crowded", "noisy", "uncomfortable", "terrible", "bad", "hate", "awful"];

        const posCount = positiveWords.filter((w) => textLower.includes(w)).length;
        const negCount = negativeWords.filter((w) => textLower.includes(w)).length;

        const sentiment = posCount > negCount ? "positive" : negCount > posCount ? "negative" : "neutral";

        res.json({
            sentiment,
            tags,
            noiseDetected: hasNoise,
            lightingDetected: hasLight,
            crowdDetected: hasCrowd,
            summary: `AI detected ${tags.length} sensory signal(s). Overall sentiment: ${sentiment}.`,
        });
    } catch (error) {
        console.error("Error analyzing review:", error);
        res.status(500).json({ error: "Failed to analyze review" });
    }
});

export default router;