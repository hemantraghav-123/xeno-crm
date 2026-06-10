import { Router } from "express";
import {
  createAISegment,
  executeAISegment,
} from "../controllers/segment.controller";

const router = Router();

router.post("/ai", createAISegment);

router.post("/execute", executeAISegment);

export default router;