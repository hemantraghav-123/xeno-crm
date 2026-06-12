import { Router } from "express";
import {
  createCustomer,
  generateCustomers,
  getCustomers,
} from "../controllers/Customer.controller";

const router = Router();

router.get("/", getCustomers);
router.post("/", createCustomer);
router.post("/generate", generateCustomers);

export default router;
