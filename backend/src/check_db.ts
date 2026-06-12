import { prisma } from "./prisma/prisma";

async function main() {
  const customers = await prisma.customer.findMany({
    take: 5,
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
      },
      communications: {
        include: {
          campaign: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCustomers = customers.map((customer) => {
    const totalSpend = customer.orders.reduce(
      (sum, order) => sum + order.amount,
      0
    );
    return {
      ...customer,
      totalSpend,
    };
  });

  console.log("KEYS of formatted customer:", Object.keys(formattedCustomers[0]));
  console.log("Is orders an array?:", Array.isArray(formattedCustomers[0].orders));
  console.log("Orders count in formatted:", formattedCustomers[0].orders?.length);
  console.log("Full first formatted customer JSON:");
  console.log(JSON.stringify(formattedCustomers[0], null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
