import { model } from "./gemini.client";

function cleanJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    return cleaned;
  }
  return cleaned.slice(start, end + 1);
}

function buildFallbackInsight(analytics: any, kpis: any) {
  const sent = analytics.sent || 0;
  const delivered = analytics.delivered || 0;
  const opened = analytics.opened || 0;
  const clicked = analytics.clicked || 0;

  const deliveryRate = kpis.deliveryRate || 0;
  const openRate = kpis.openRate || 0;
  const clickRate = kpis.clickRate || 0;

  if (sent === 0) {
    return {
      summary: "No campaign communications have been dispatched yet.",
      recommendation: "Go to the Campaigns tab and click 'Send Campaign' to trigger simulated customer responses and generate real-time metrics.",
      isFallback: true
    };
  }

  const summary = `The campaign was sent to ${sent} customers, achieving a ${deliveryRate.toFixed(1)}% delivery rate (${delivered} delivered). We tracked ${opened} opens and ${clicked} clicks, representing a click-through rate of ${clickRate.toFixed(1)}%.`;

  let recommendation = "";
  if (deliveryRate < 70) {
    recommendation = "The delivery rate is lower than expected. We recommend auditing customer contact details to filter out inactive phone numbers and poorly-formatted emails.";
  } else if (openRate < 35) {
    recommendation = "Message opens are low. Try personalizing the message template using the customer's name more effectively and testing different delivery time slots (like weekends vs. weekdays).";
  } else if (clickRate < 15) {
    recommendation = "Customers are opening the message but not clicking through. Consider adding a stronger call-to-action (CTA), creating urgency (e.g., 'offer expires in 24 hours'), or raising the discount incentive.";
  } else {
    recommendation = "Strong campaign performance observed. We suggest creating a re-engagement segment for customers who opened but did not click, prompting them with a limited-time extra benefit.";
  }

  return { summary, recommendation, isFallback: true };
}

export async function generateInsight(
  analytics: any,
  kpis: any
) {
  try {
    const prompt = `
You are a CRM analytics expert.

Analytics:

${JSON.stringify(analytics)}

KPIs:

${JSON.stringify(kpis)}

Provide:

{
 "summary":"",
 "recommendation":""
}

Return JSON only.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.warn("Gemini insight generation failed, using database-driven fallback.", error);
    return buildFallbackInsight(analytics, kpis);
  }
}
