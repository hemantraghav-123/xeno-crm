import "dotenv/config";
import express from "express";
import cors from "cors";

import customerRoutes from "./routes/Customer.routes";
import orderRoutes from "./routes/Order.routes";
import campaignRoutes from "./routes/campaign.routes";
import seedRoutes from "./routes/seed.routes";
import segmentRoutes from "./routes/segment.routes";
import communicationRoutes from "./routes/communication.routes";
import aiCampaignRoutes from "./routes/aiCampaign.routes";
import { createAICampaign } from "./controllers/aiCampaign.controller";
import dashboardRoutes from "./routes/dashboard.routes";
import analyticsRoutes from "./routes/analytics.routes";
import authRoutes from "./routes/auth.routes";
import { requireAuth } from "./middleware/auth.middleware";



const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://xeno-crm-pied.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/customers", requireAuth, customerRoutes);
app.use("/api/orders", requireAuth, orderRoutes);
app.use("/api/campaigns", requireAuth, campaignRoutes);
app.use("/api/seed", requireAuth, seedRoutes);
app.use("/api/segments", requireAuth, segmentRoutes);
app.use(
  "/api/communications",
  requireAuth,
  communicationRoutes
);
app.use(
  "/api/ai-campaign",
  requireAuth,
  aiCampaignRoutes
);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/analytics", requireAuth, analyticsRoutes);
app.post("/api/ai-campaign/create", requireAuth, createAICampaign);
app.get("/", (_, res) => {
  res.send("Xeno CRM Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});