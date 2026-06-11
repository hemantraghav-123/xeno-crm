import { Router } from "express";
import {
  getAllCampaigns,
  createCampaign,
  sendCampaign,
  getCampaignAnalytics,
} from "../controllers/campaign.controller";

const router = Router();

router.get("/", getAllCampaigns);
router.post("/", createCampaign);

router.post("/:id/send", sendCampaign);

router.get("/:id/analytics", getCampaignAnalytics);

export default router;