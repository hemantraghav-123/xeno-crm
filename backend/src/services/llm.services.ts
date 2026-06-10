import { geminiModel } from "./gemini.client";

export async function generateSegmentRules(
  userPrompt: string
) {
  const prompt = `
You are a CRM segmentation assistant.

Convert marketer requests into JSON.

Return ONLY JSON.

Examples:

Input:
Customers who spent more than 10000
and have not purchased in 60 days

Output:
{
  "minSpend": 10000,
  "inactiveDays": 60
}

User Request:
${userPrompt}
`;

  const result =
    await geminiModel.generateContent(prompt);

  const text =
    result.response.text();

  const cleaned = text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(cleaned);
}