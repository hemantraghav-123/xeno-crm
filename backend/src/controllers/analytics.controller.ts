import { Request, Response } from "express";

import {
  getCampaignAnalytics,
  calculateKPIs
} from "../services/analytics.service";

import {
  generateInsight
} from "../services/insight.service";

export const getAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const rawId = req.params.id;
    const campaignId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!campaignId) {
      return res.status(400).json({ error: "campaign id is required" });
    }

    const analytics = await getCampaignAnalytics(campaignId);
    const kpis = calculateKPIs(analytics);
    const insight = await generateInsight(analytics, kpis);

    res.json({
      analytics,
      kpis,
      insight
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to generate campaign analytics report"
    });
  }
};
