import express from "express";
import rateLimit from "express-rate-limit";
import { syncContext, getMyContext } from "../controllers/contextController.js";
import { getPublicWeather } from "../controllers/weatherController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const weatherLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/weather", weatherLimiter, getPublicWeather);

router.use(verifyToken);

router.get("/me", getMyContext);
router.post("/sync", syncContext);

export default router;
