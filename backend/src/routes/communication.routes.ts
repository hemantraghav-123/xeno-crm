import { Router } from "express";
import { communicationCallback } from "../controllers/communication.controller";

const router = Router();

router.post("/callback", communicationCallback);

export default router;