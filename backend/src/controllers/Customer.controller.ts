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

    const customers = [];

    for (let i = 0; i < count; i++) {
      customers.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      });
    }

    await prisma.customer.createMany({
      data: customers,
    });

    res.json({
      success: true,
      generated: count,
    });
  } catch (error) {
    res.status(500).json(error);
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