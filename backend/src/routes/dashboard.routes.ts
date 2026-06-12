import { Router } from "express";
import { getDashboardStats, getAggregateAnalytics, getCohortRetention } from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", getDashboardStats);
router.get("/analytics", getAggregateAnalytics);
router.get("/cohorts", getCohortRetention);

export default router;
