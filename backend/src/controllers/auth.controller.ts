import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../prisma/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendResetEmail } from "../utils/mailer";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-production";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(400).json({ error: "A user with this email already exists." });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error during registration." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login." });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // For security, don't reveal if the user exists or not.
    // Just return success, but actually send the email only if the user exists.
    if (!user) {
      res.json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent.",
      });
      return;
    }

    // Generate token & expiry
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: tokenExpiry,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const mailResult = await sendResetEmail(normalizedEmail, resetLink);

    res.json({
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
      // Include the link in the response in development mode for easier debugging/testing
      resetLink: process.env.NODE_ENV !== "production" ? resetLink : undefined,
      loggedToConsole: mailResult.loggedToConsole,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: "Token and password are required." });
      return;
    }

    // Find valid user with this token that is not expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset token." });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
