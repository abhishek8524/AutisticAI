import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "locations route live" });
});

export default router;