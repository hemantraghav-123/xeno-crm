import { geminiModel } from "./gemini.client";

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("AI response did not contain valid JSON.");
  }

  return cleaned.slice(start, end + 1);
}

function buildFallbackRules(userPrompt: string) {
  const normalizedPrompt = userPrompt.toLowerCase();

  const spendMatch = normalizedPrompt.match(
    /(?:spent over|spend over|over|above|more than|minimum spend)[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+)/i
  );

  const inactiveMatch = normalizedPrompt.match(
    /(?:inactive for|haven't ordered in|not ordered in|no orders in)\s*(\d+)\s*days?/i
  );

  return {
    minSpend: spendMatch
      ? Number(spendMatch[1].replace(/,/g, ""))
      : 0,
    inactiveDays: inactiveMatch
      ? Number(inactiveMatch[1])
      : 30,
  };
}

export async function generateSegmentRules(userPrompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const prompt = `
You are a CRM segmentation assistant.

Convert marketer requests into JSON filters.
Return ONLY valid JSON with no extra text.

Example output:
{
  "minSpend": 10000,
  "inactiveDays": 60
}

User Request:
${userPrompt}
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(extractJson(text));
  } catch (error) {
    return buildFallbackRules(userPrompt);
  }
}

export async function generateSegmentRulesSafely(
  userPrompt: string
) {
  try {
    return await generateSegmentRules(userPrompt);
  } catch (error) {
    return buildFallbackRules(userPrompt);
  }
}