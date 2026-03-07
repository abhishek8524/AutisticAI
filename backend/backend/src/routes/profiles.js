import express from "express";
import prisma from "../lib/prisma.js";
import checkJwt from "../middleware/auth.js";

const router = express.Router();

// GET /api/profiles/me — Get authenticated user's sensory profile
router.get("/me", checkJwt, async (req, res) => {
    try {
        const auth0Id = req.auth?.payload?.sub;
        if (!auth0Id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { auth0Id },
            include: { sensoryProfile: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            userId: user.id,
            email: user.email,
            username: user.username,
            sensoryProfile: user.sensoryProfile || null,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// PUT /api/profiles/me — Create or update sensory profile
router.put("/me", checkJwt, async (req, res) => {
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

        const { noiseTolerance, lightingTolerance, crowdTolerance, notes } = req.body;

        const profile = await prisma.sensoryProfile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                noiseTolerance: noiseTolerance ?? 5,
                lightingTolerance: lightingTolerance ?? 5,
                crowdTolerance: crowdTolerance ?? 5,
                notes: notes || null,
            },
            update: {
                noiseTolerance: noiseTolerance ?? undefined,
                lightingTolerance: lightingTolerance ?? undefined,
                crowdTolerance: crowdTolerance ?? undefined,
                notes: notes !== undefined ? notes : undefined,
            },
        });

        res.json({ message: "Profile updated", sensoryProfile: profile });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

export default router;