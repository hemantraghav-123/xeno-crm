import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

export const model = geminiModel;

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

function buildFallbackCampaign(goal: string) {
  const normalizedGoal = goal.toLowerCase();

  if (
    normalizedGoal.includes("inactive") ||
    normalizedGoal.includes("win back")
  ) {
    return {
      campaignName: "We Miss You",
      recommendedChannel: "WHATSAPP",
      message:
        "Hi {{name}}, it's been a while! Enjoy 15% off your next order to come back and say hello.",
      reasoning:
        "WhatsApp has the highest engagement for inactive shoppers.",
      expectedOutcome:
        "Increase repeat purchases by 8-12%",
    };
  }

  return {
    campaignName: "Re-Engage Customers",
    recommendedChannel: "EMAIL",
    message:
      "Hi {{name}}, we’d love to welcome you back. Check out what’s new and enjoy a special offer just for you.",
    reasoning:
      "Email is a versatile channel that can reach a broad audience effectively.",
    expectedOutcome:
      "Boost customer re-engagement by 5-10%",
    };
}

  export async function generateCampaign(
  goal: string
) {
  const prompt = `
You are a CRM marketing expert.

Generate a campaign.

Return JSON only.

Format:

{
  "campaignName":"",
  "recommendedChannel":"",
  "message":"",
  "reasoning":"",
  "expectedOutcome":""
}
Goal:
${goal}
`;

  const result =
    await geminiModel.generateContent(prompt);

  const text =
    result.response.text();

  try {
    return JSON.parse(extractJson(text));
  } catch (error) {
    console.warn("Gemini returned non-JSON campaign output, using fallback.", error);
    return buildFallbackCampaign(goal);
  }
}

export async function generateCampaignSafely(goal: string) {
  try {
    return await generateCampaign(goal);
  } catch (error) {
    console.error("Gemini campaign generation failed, using fallback.", error);
    return buildFallbackCampaign(goal);
  }
}