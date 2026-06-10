import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

export const seedData = async (
  req: Request,
  res: Response
) => {
  try {
    const { faker } = await import("@faker-js/faker");
    for (let i = 0; i < 50; i++) {
      const customer = await prisma.customer.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      });

      const orderCount = faker.number.int({
        min: 1,
        max: 8,
      });

      for (let j = 0; j < orderCount; j++) {
        await prisma.order.create({
          data: {
            amount: faker.number.int({
              min: 500,
              max: 15000,
            }),
            customerId: customer.id,
          },
        });
      }
    }

    res.json({
      message: "Seed data generated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Seed failed",
    });
  }
};