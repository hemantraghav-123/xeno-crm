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


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/segments", segmentRoutes);
app.use(
  "/api/communications",
  communicationRoutes
);
app.use(
  "/api/ai-campaign",
  aiCampaignRoutes
);
app.post("/api/ai-campaign/create", createAICampaign);
app.get("/", (_, res) => {
  res.send("Xeno CRM Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});