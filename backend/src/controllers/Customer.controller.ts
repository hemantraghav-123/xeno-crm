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

export const generateCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const { faker } = await import("@faker-js/faker");
    const count = Number(req.body.count || 100);

    const customersData = [];
    for (let i = 0; i < count; i++) {
      customersData.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.helpers.fromRegExp("+91 [7-9][0-9]{9}"),
      });
    }

    // Insert customers in bulk
    await prisma.customer.createMany({
      data: customersData,
      skipDuplicates: true,
    });

    // Query all customers that currently have no orders and generate order records for them
    const allCustomers = await prisma.customer.findMany({
      include: {
        orders: true,
      },
    });

    const customersWithoutOrders = allCustomers.filter(
      (c) => c.orders.length === 0
    );

    const ordersData = [];
    for (const customer of customersWithoutOrders) {
      const orderCount = faker.number.int({ min: 1, max: 8 });
      for (let j = 0; j < orderCount; j++) {
        ordersData.push({
          amount: faker.number.float({ min: 200, max: 15000, multipleOf: 0.01 }),
          customerId: customer.id,
          createdAt: faker.date.past({ years: 1 }),
        });
      }
    }

    if (ordersData.length > 0) {
      await prisma.order.createMany({
        data: ordersData,
      });
    }

    res.json({
      success: true,
      generated: count,
      ordersGenerated: ordersData.length,
    });
  } catch (error) {
    console.error("Generate customers error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
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