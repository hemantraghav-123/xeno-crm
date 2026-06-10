import { prisma } from "../prisma/prisma";

export async function findAudience(
  rules: any
) {
  const customers =
    await prisma.customer.findMany({
      include: {
        orders: true,
      },
    });

  const now = new Date();

  return customers.filter((customer) => {
    const totalSpend =
      customer.orders.reduce(
        (sum, order) => sum + order.amount,
        0
      );

    const lastOrder =
      customer.orders.sort(
        (a, b) =>
          b.createdAt.getTime() -
          a.createdAt.getTime()
      )[0];

    const inactiveDays =
      lastOrder
        ? Math.floor(
            (now.getTime() -
              lastOrder.createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999;

    return (
      totalSpend >=
        (rules.minSpend || 0) &&
      inactiveDays >=
        (rules.inactiveDays || 0)
    );
  });
}