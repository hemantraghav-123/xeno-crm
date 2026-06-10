import { Router } from "express";
import {
  createCustomer,
  generateCustomers,
} from "../controllers/Customer.controller";

const router = Router();

router.post("/", createCustomer);
router.post("/generate", generateCustomers);

export default router;
