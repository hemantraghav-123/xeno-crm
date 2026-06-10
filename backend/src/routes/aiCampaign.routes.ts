import { Router } from "express";
import {
  createAICampaign,
  generateAICampaign
} from "../controllers/aiCampaign.controller";

const router = Router();

router.post(
  "/create",
  createAICampaign
);

router.post(
  "/generate",
  generateAICampaign
);

export default router;