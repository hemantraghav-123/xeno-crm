import { Router } from "express";
import { register, login, getMe, forgotPassword, resetPassword, deleteAccount } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete("/delete-account", requireAuth, deleteAccount);

export default router;
