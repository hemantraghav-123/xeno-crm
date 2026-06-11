import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

export const seedData = async (
  req: Request,
  res: Response
) => {
  try {
    const { faker } = await import("@faker-js/faker");

    // Clean up existing data in correct order of dependency
    console.log("Cleaning up database...");
    await prisma.communication.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.segment.deleteMany();

    console.log("Seeding customers...");
    const createdCustomers = [];
    for (let i = 0; i < 50; i++) {
      const customer = await prisma.customer.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          phone: faker.helpers.fromRegExp("+91 [7-9][0-9]{9}"),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
      createdCustomers.push(customer);
    }

    console.log("Seeding orders...");
    for (const customer of createdCustomers) {
      const orderCount = faker.number.int({ min: 1, max: 6 });
      for (let j = 0; j < orderCount; j++) {
        await prisma.order.create({
          data: {
            amount: faker.number.float({ min: 100, max: 15000, multipleOf: 0.01 }),
            customerId: customer.id,
            createdAt: faker.date.past({ years: 1 }),
          },
        });
      }
    }

    console.log("Seeding campaigns...");
    const campaignsData = [
      {
        name: "We Miss You",
        channel: "WHATSAPP",
        message: "Hi {{name}}, it's been a while! Enjoy 15% off your next order...",
      },
      {
        name: "New Season Launch",
        channel: "EMAIL",
        message: "Hi {{name}}, check out our brand new summer collection now! Use code SUMMER10.",
      },
      {
        name: "Weekend Flash Sale",
        channel: "SMS",
        message: "Hi {{name}}, flash sale starts now! 20% off all items with code FLASH20. Ends Sunday.",
      },
    ];

    const createdCampaigns = [];
    for (const cData of campaignsData) {
      const campaign = await prisma.campaign.create({
        data: {
          name: cData.name,
          channel: cData.channel,
          message: cData.message,
          audienceSize: faker.number.int({ min: 10, max: 35 }),
        },
      });
      createdCampaigns.push(campaign);
    }

    console.log("Seeding communications...");
    for (const campaign of createdCampaigns) {
      // Connect this campaign to 15-25 random customers
      const targetedCustomers = faker.helpers.arrayElements(createdCustomers, {
        min: 15,
        max: 25,
      });

      for (const customer of targetedCustomers) {
        const status = faker.helpers.arrayElement([
          "PENDING",
          "SENT",
          "DELIVERED",
          "OPENED",
          "CLICKED",
        ]);

        const deliveredAt = status !== "PENDING" && status !== "SENT" ? faker.date.recent() : null;
        const openedAt = status === "OPENED" || status === "CLICKED" ? faker.date.between({ from: deliveredAt!, to: new Date() }) : null;
        const clickedAt = status === "CLICKED" ? faker.date.between({ from: openedAt!, to: new Date() }) : null;

        await prisma.communication.create({
          data: {
            customerId: customer.id,
            campaignId: campaign.id,
            status,
            channel: campaign.channel,
            message: campaign.message.replace("{{name}}", customer.name),
            deliveredAt,
            openedAt,
            clickedAt,
            createdAt: faker.date.recent({ days: 7 }),
          },
        });
      }
    }

    console.log("Seeding segments...");
    const segmentsData = [
      {
        name: "High Spenders (> ₹10,000)",
        description: "Customers who have spent more than ₹10,000 in total.",
        rules: { minSpend: 10000 },
      },
      {
        name: "Inactive Customers (> 60 days)",
        description: "Customers who have not ordered anything in the last 60 days.",
        rules: { inactiveDays: 60 },
      },
      {
        name: "Active Loyal Customers",
        description: "Customers with more than 3 orders.",
        rules: { minOrders: 3 },
      },
    ];

    for (const sData of segmentsData) {
      await prisma.segment.create({
        data: {
          name: sData.name,
          description: sData.description,
          rules: sData.rules,
        },
      });
    }

    console.log("Database seeded successfully!");
    res.json({
      success: true,
      message: "Database successfully seeded with test data",
      counts: {
        customers: createdCustomers.length,
        campaigns: createdCampaigns.length,
        segments: segmentsData.length,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed database",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};