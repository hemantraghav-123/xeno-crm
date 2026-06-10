import { Router } from "express";
import { generateOrders } from "../controllers/Order.controller";

const router = Router();

router.post("/generate", generateOrders);

export default router;