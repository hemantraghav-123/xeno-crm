import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

export const getDashboardStats = async (
    req: Request,
    res: Response
) => {
    try {
        const [customerCount, orderCount, campaignCount, sent, delivered, opened, clicked] =
            await Promise.all([
                prisma.customer.count(),
                prisma.order.count(),
                prisma.campaign.count(),
                prisma.communication.count(),
                prisma.communication.count({
                    where: {
                        status: {
                            in: ["DELIVERED", "OPENED", "CLICKED"],
                        },
                    },
                }),
                prisma.communication.count({
                    where: {
                        status: {
                            in: ["OPENED", "CLICKED"],
                        },
                    },
                }),
                prisma.communication.count({
                    where: {
                        status: "CLICKED",
                    },
                }),
            ]);

        const openRate = delivered ? (opened / delivered) * 100 : 0;
        const clickRate = opened ? (clicked / opened) * 100 : 0;

        res.json({
            customers: customerCount,
            orders: orderCount,
            campaigns: campaignCount,
            messages: sent,
            openRate,
            clickRate,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch stats",
        });
    }
};

export const getAggregateAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const [sent, delivered, opened, clicked] =
      await Promise.all([
        prisma.communication.count(),
        prisma.communication.count({
          where: {
            status: {
              in: ["DELIVERED", "OPENED", "CLICKED"],
            },
          },
        }),
        prisma.communication.count({
          where: {
            status: {
              in: ["OPENED", "CLICKED"],
            },
          },
        }),
        prisma.communication.count({
          where: {
            status: "CLICKED",
          },
        }),
      ]);

    res.json({
      sent,
      delivered,
      opened,
      clicked,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch aggregate analytics",
    });
  }
};