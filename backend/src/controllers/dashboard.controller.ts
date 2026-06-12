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

export const getCohortRetention = async (req: Request, res: Response) => {
  try {
    // Fetch all customers with their orders and signup dates
    const customers = await prisma.customer.findMany({
      include: {
        orders: true,
      },
    });

    if (customers.length === 0) {
      // Return high-fidelity mock data if no customers exist in DB
      return res.json([
        { cohort: "Jan 2026", total: 45, retention: [100, 48.2, 42.1, 38.5, 35.0, 31.4] },
        { cohort: "Feb 2026", total: 60, retention: [100, 46.5, 40.8, 36.2, 33.1] },
        { cohort: "Mar 2026", total: 55, retention: [100, 50.1, 44.5, 39.8] },
        { cohort: "Apr 2026", total: 72, retention: [100, 47.9, 41.2] },
        { cohort: "May 2026", total: 80, retention: [100, 52.4] },
        { cohort: "Jun 2026", total: 38, retention: [100] },
      ]);
    }

    // Group customers by signup month: e.g. "2026-01"
    const cohortsMap: { [key: string]: typeof customers } = {};
    customers.forEach((customer) => {
      const date = new Date(customer.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;
      if (!cohortsMap[key]) {
        cohortsMap[key] = [];
      }
      cohortsMap[key].push(customer);
    });

    // Sort cohort keys ascending
    const sortedCohortKeys = Object.keys(cohortsMap).sort();

    const result = sortedCohortKeys.map((cohortKey) => {
      const cohortCustomers = cohortsMap[cohortKey];
      const totalUsers = cohortCustomers.length;

      // Extract year & month from key
      const [year, month] = cohortKey.split("-").map(Number);
      const cohortDate = new Date(year, month - 1, 1);
      const cohortLabel = cohortDate.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });

      // Calculate retention rates for Month 0 to Month 5
      const retention: number[] = [];
      
      // Limit to max 6 months offset or until current date limit
      const currentDate = new Date();
      const monthsDiff = (currentDate.getFullYear() - year) * 12 + (currentDate.getMonth() - (month - 1));
      const targetMonths = Math.min(6, monthsDiff + 1);

      for (let offset = 0; offset < Math.max(1, targetMonths); offset++) {
        if (offset === 0) {
          retention.push(100); // Month 0 is always 100%
          continue;
        }

        // Count customers who ordered in (cohort month + offset)
        let activeUsersInOffset = 0;

        cohortCustomers.forEach((customer) => {
          const hasOrderInOffset = customer.orders.some((order) => {
            const orderDate = new Date(order.createdAt);
            const diff = (orderDate.getFullYear() - year) * 12 + (orderDate.getMonth() - (month - 1));
            return diff === offset;
          });

          if (hasOrderInOffset) {
            activeUsersInOffset++;
          }
        });

        const rate = totalUsers > 0 ? (activeUsersInOffset / totalUsers) * 100 : 0;
        retention.push(Number(rate.toFixed(1)));
      }

      return {
        cohort: cohortLabel,
        total: totalUsers,
        retention,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Cohort analysis error:", error);
    res.status(500).json({ error: "Failed to calculate cohorts." });
  }
};