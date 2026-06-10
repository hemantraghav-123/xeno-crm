import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";
import { generateSegmentRulesSafely } from "../services/ai.service";
import { findAudience } from "../services/segment.service";
import { generateCampaignSafely } from "../services/gemini.client";

export const generateAICampaign =
async (req: Request, res: Response) => {
  try {
    const goal = req.body.goal;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({
        error: "goal is required",
      });
    }

    const normalizedGoal = goal.toLowerCase();

    if (
      normalizedGoal.includes("inactive") ||
      normalizedGoal.includes("win back")
    ) {
      return res.json({
        campaignName: "We Miss You",
        recommendedChannel: "WHATSAPP",
        message:
          "Hi {{name}}, it's been a while! Enjoy 15% off your next order...",
      });
    }

    const campaign =
      await generateCampaignSafely(
        goal
      );

    res.json(campaign);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate AI campaign",
    });
  }
};

export const createAICampaign = async (
  req: Request,
  res: Response
) => {
  try {
    const goal = req.body?.goal;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({
        error: "goal is required",
      });
    }

    const normalizedGoal = goal.toLowerCase();

    const campaignPreview =
      normalizedGoal.includes("inactive") ||
      normalizedGoal.includes("win back")
        ? {
            campaignName: "We Miss You",
            recommendedChannel: "WHATSAPP",
            message:
              "Hi {{name}}, it's been a while! Enjoy 15% off your next order...",
          }
        : await generateCampaignSafely(goal);

    const rules = await generateSegmentRulesSafely(goal);
    const audience = await findAudience(rules);

    const campaign = await prisma.campaign.create({
      data: {
        name: campaignPreview.campaignName,
        channel: campaignPreview.recommendedChannel,
        message: campaignPreview.message,
        audienceSize: audience.length,
      },
    });

    return res.status(201).json({
      success: true,
      goal,
      rules,
      audienceSize: audience.length,
      audiencePreview: audience.slice(0, 20),
      campaign,
      preview: {
        campaignName: campaign.name,
        recommendedChannel: campaign.channel,
        message: campaign.message,
      },
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Unknown AI campaign error";

    const isRateLimit =
      message.includes("429") ||
      /quota|rate limit/i.test(message);

    return res.status(isRateLimit ? 429 : 500).json({
      error: isRateLimit
        ? "AI quota/rate limit reached. Please retry later."
        : "Failed to create AI campaign",
      message,
    });
  }
};