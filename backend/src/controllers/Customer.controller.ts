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