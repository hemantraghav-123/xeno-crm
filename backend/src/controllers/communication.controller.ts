import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

export const communicationCallback = async (
  req: Request,
  res: Response
) => {
  try {
    const { communicationId, status } = req.body;

    const updateData: any = {
      status,
    };

    // Store timestamps
    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    if (status === "OPENED") {
      updateData.openedAt = new Date();
    }

    if (status === "CLICKED") {
      updateData.clickedAt = new Date();
    }

    const communication =
      await prisma.communication.update({
        where: {
          id: communicationId,
        },
        data: updateData,
      });

    return res.json({
      success: true,
      communication,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Callback failed",
    });
  }
};