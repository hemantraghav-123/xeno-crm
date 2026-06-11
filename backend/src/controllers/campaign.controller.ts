import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";
import { sendToChannel } from "../services/channelClient";

export const getAllCampaigns = async (
  req: Request,
  res: Response
) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        communications: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedCampaigns = campaigns.map((campaign) => {
      const communications = campaign.communications;
      const sent = communications.length;
      
      const delivered = communications.filter((c) =>
        ["DELIVERED", "OPENED", "CLICKED"].includes(c.status)
      ).length;
      
      const opened = communications.filter((c) =>
        ["OPENED", "CLICKED"].includes(c.status)
      ).length;
      
      const clicked = communications.filter((c) =>
        c.status === "CLICKED"
      ).length;

      const deliveryRate = sent ? (delivered / sent) * 100 : 0;
      const openRate = delivered ? (opened / delivered) * 100 : 0;
      const clickRate = opened ? (clicked / opened) * 100 : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        channel: campaign.channel,
        message: campaign.message,
        audienceSize: campaign.audienceSize,
        createdAt: campaign.createdAt,
        status: sent > 0 ? "SENT" : "PENDING",
        sent,
        deliveryRate,
        openRate,
        clickRate,
      };
    });

    res.json(mappedCampaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch campaigns",
    });
  }
};

export const createCampaign = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, channel, message } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        channel,
        message,
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create campaign",
    });
  }
};

export const sendCampaign = async (
  req: Request,
  res: Response
) => {
  try {
    const rawId = req.params.id;
    const campaignId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!campaignId) {
      return res.status(400).json({ error: "campaign id is required" });
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        error: "Campaign not found",
      });
    }

    const customers = await prisma.customer.findMany();

    let sentCount = 0;

    for (const customer of customers) {
      const communication =
        await prisma.communication.create({
          data: {
            campaignId: campaign.id,
            customerId: customer.id,
            channel: campaign.channel,
            message: campaign.message,
            status: "PENDING",
          },
        });

      try {
        await sendToChannel({
          communicationId: communication.id,
          customerId: customer.id,
          recipient: customer.phone,
          channel: campaign.channel,
          message: campaign.message,
        });

        sentCount++;
      } catch (channelError) {
        console.error(
          `Failed to send communication ${communication.id}`
        );

        await prisma.communication.update({
          where: {
            id: communication.id,
          },
          data: {
            status: "FAILED",
          },
        });
      }
    }

    return res.json({
      success: true,
      campaignId: campaign.id,
      recipients: customers.length,
      queued: sentCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to send campaign",
    });
  }
};

export const getCampaignAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const rawId = req.params.id;
    const campaignId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!campaignId) {
      return res.status(400).json({ error: "campaign id is required" });
    }

    const [sent, delivered, opened, clicked] =
      await Promise.all([
        prisma.communication.count({
          where: {
            campaignId,
          },
        }),
        prisma.communication.count({
          where: {
            campaignId,
            status: {
              in: ["DELIVERED", "OPENED", "CLICKED"],
            },
          },
        }),
        prisma.communication.count({
          where: {
            campaignId,
            status: {
              in: ["OPENED", "CLICKED"],
            },
          },
        }),
        prisma.communication.count({
          where: {
            campaignId,
            status: "CLICKED",
          },
        }),
      ]);

    res.json({
      campaignId,
      sent,
      delivered,
      opened,
      clicked,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch analytics",
    });
  }
};