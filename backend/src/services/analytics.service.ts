import { prisma } from "../prisma/prisma";

export async function getCampaignAnalytics(
  campaignId: string
) {
  const communications =
    await prisma.communication.findMany({
      where: {
        campaignId,
      },
    });

  const sent = communications.length;

  const delivered =
    communications.filter(
      c => c.status === "DELIVERED"
    ).length;

  const opened =
    communications.filter(
      c => c.status === "OPENED"
    ).length;

  const clicked =
    communications.filter(
      c => c.status === "CLICKED"
    ).length;

  return {
    sent,
    delivered,
    opened,
    clicked,
  };
}

export function calculateKPIs(
  analytics: any
) {
  return {
    deliveryRate:
      analytics.sent
        ? (
            analytics.delivered /
            analytics.sent
          ) * 100
        : 0,

    openRate:
      analytics.delivered
        ? (
            analytics.opened /
            analytics.delivered
          ) * 100 // using slightly custom mapping or exact math as requested
        : 0,

    clickRate:
      analytics.opened
        ? (
            analytics.clicked /
            analytics.opened
          ) * 100
        : 0,
  };
}
