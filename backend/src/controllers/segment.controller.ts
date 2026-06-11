import { Request, Response } from "express";
import { generateSegmentRules } from "../services/ai.service";
import { findAudience } from "../services/segment.service";

export const createAISegment = async (
  req: Request,
  res: Response
) => {
  try {
    const prompt = req.body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        message: "'prompt' is required and must be a string.",
      });
    }

    const rules = await generateSegmentRules(prompt);

    return res.json(rules);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown AI error";

    const isRateLimit =
      message.includes("429") ||
      /quota|rate limit/i.test(message);

    return res.status(isRateLimit ? 429 : 500).json({
      message: isRateLimit
        ? "AI quota/rate limit reached. Please retry later."
        : "Failed to generate segment rules.",
      error: message,
    });
  }
};

export const executeAISegment = async (
  req: Request,
  res: Response
) => {
  try {
    const prompt = req.body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        message: "'prompt' is required and must be a string.",
      });
    }

    // Step 1: Convert natural language to segment rules
    const rules = await generateSegmentRules(prompt);

    // Step 2: Execute audience query
    const audience = await findAudience(rules);

    // Step 3: Return results
    return res.json({
      success: true,
      prompt,
      rules,
      totalAudience: audience.length,
      audienceSize: audience.length,
      audience: audience.slice(0, 20),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown execution error";

    const isRateLimit =
      message.includes("429") ||
      /quota|rate limit/i.test(message);

    return res.status(isRateLimit ? 429 : 500).json({
      message: isRateLimit
        ? "AI quota/rate limit reached. Please retry later."
        : "Failed to execute AI segment.",
      error: message,
    });
  }
};