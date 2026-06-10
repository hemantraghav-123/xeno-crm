import { Router } from "express";
import {
  createCampaign,
  sendCampaign,
  getCampaignAnalytics,
} from "../controllers/campaign.controller";

const router = Router();

router.post("/", createCampaign);

router.post("/:id/send", sendCampaign);

router.get("/:id/analytics", getCampaignAnalytics);

export default router;