import { prisma } from "../prisma/prisma";

async function main() {
  const { faker } = await import("@faker-js/faker");
  console.log("Fetching customers without orders...");
  
  // Find all customers who have 0 orders
  const customersWithoutOrders = await prisma.customer.findMany({
    where: {
      orders: {
        none: {}
      }
    }
  });

  console.log(`Found ${customersWithoutOrders.length} customers with 0 orders.`);

  if (customersWithoutOrders.length === 0) {
    console.log("No customers without orders found. Exiting.");
    return;
  }

  console.log("Generating random orders...");
  let createdOrdersCount = 0;
  
  // Batch insert orders to prevent memory/timeout issues
  const BATCH_SIZE = 100;
  for (let i = 0; i < customersWithoutOrders.length; i += BATCH_SIZE) {
    const batch = customersWithoutOrders.slice(i, i + BATCH_SIZE);
    const ordersToCreate = [];

    for (const customer of batch) {
      // Create between 1 and 6 random orders per customer
      const orderCount = faker.number.int({ min: 1, max: 6 });
      for (let j = 0; j < orderCount; j++) {
        ordersToCreate.push({
          customerId: customer.id,
          amount: faker.number.float({ min: 100, max: 15000, multipleOf: 0.01 }),
          createdAt: faker.date.past({ years: 1 }),
        });
      }
    }

    if (ordersToCreate.length > 0) {
      await prisma.order.createMany({
        data: ordersToCreate,
      });
      createdOrdersCount += ordersToCreate.length;
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(customersWithoutOrders.length / BATCH_SIZE)}: created ${ordersToCreate.length} orders.`);
    }
  }

  console.log(`Done! Created a total of ${createdOrdersCount} orders for ${customersWithoutOrders.length} customers.`);
  
  // Print updated statistics
  const totalCustomers = await prisma.customer.count();
  const totalOrders = await prisma.order.count();
  const customersWithOrders = await prisma.customer.count({
    where: {
      orders: { some: {} }
    }
  });
  
  console.log("\n=== Updated Database Stats ===");
  console.log("Total Customers:", totalCustomers);
  console.log("Total Orders:", totalOrders);
  console.log("Customers with at least 1 order:", customersWithOrders);
  console.log("Customers with 0 orders:", totalCustomers - customersWithOrders);
}

main()
  .catch((e) => {
    console.error("Error seeding missing orders:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
