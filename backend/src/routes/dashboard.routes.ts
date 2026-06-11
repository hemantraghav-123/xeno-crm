import { Router } from "express";
import { getDashboardStats, getAggregateAnalytics } from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", getDashboardStats);
router.get("/analytics", getAggregateAnalytics);

export default router;
