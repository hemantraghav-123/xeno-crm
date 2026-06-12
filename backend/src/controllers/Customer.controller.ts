import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

export const createCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const customer = await prisma.customer.create({
      data: req.body,
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json(error);
  }
};

import crypto from "crypto";

export const generateCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const { faker } = await import("@faker-js/faker");
    const count = Number(req.body.count || 100);

    const customersData = [];
    const ordersData = [];

    for (let i = 0; i < count; i++) {
      const customerId = crypto.randomUUID();
      const email = faker.internet.email().toLowerCase();

      customersData.push({
        id: customerId,
        name: faker.person.fullName(),
        email: email,
        phone: faker.helpers.fromRegExp("+91 [7-9][0-9]{9}"),
        createdAt: faker.date.past({ years: 1 }),
      });

      // generate random number of orders (1 to 8) for each customer
      const orderCount = faker.number.int({ min: 1, max: 8 });
      for (let j = 0; j < orderCount; j++) {
        ordersData.push({
          id: crypto.randomUUID(),
          customerId: customerId,
          amount: faker.number.float({ min: 100, max: 15000, multipleOf: 0.01 }),
          createdAt: faker.date.past({ years: 1 }),
        });
      }
    }

    await prisma.customer.createMany({
      data: customersData,
      skipDuplicates: true,
    });

    await prisma.order.createMany({
      data: ordersData,
      skipDuplicates: true,
    });

    res.json({
      success: true,
      generatedCustomers: customersData.length,
      generatedOrders: ordersData.length,
    });
  } catch (error) {
    console.error("Generate customers error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate mock data" });
  }
};

export const getCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search ? String(req.query.search).trim() : "";

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        orders: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.customer.count({
      where: whereClause,
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

    res.json({
      customers: formattedCustomers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};