import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

export const generateOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const { faker } = await import("@faker-js/faker");
    const customers = await prisma.customer.findMany();

    const orders = [];

    for (const customer of customers) {
      const orderCount = faker.number.int({
        min: 1,
        max: 10,
      });

      for (let i = 0; i < orderCount; i++) {
        orders.push({
          customerId: customer.id,

          amount: faker.number.int({
            min: 500,
            max: 15000,
          }),

          createdAt: faker.date.recent({
            days: 365,
          }),
        });
      }
    }

    await prisma.order.createMany({
      data: orders,
    });

    res.json({
      generated: orders.length,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};