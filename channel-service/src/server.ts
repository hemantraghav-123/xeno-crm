import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "running", service: "Channel Service" });
});

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function sendCallback(
  communicationId: string,
  status: "DELIVERED" | "OPENED" | "CLICKED" | "FAILED"
) {
  try {
    await axios.post(
      `${BACKEND_URL}/api/communications/callback`,
      {
        communicationId,
        status,
      }
    );
  } catch (error) {
    console.error(`Failed to send ${status} callback for ${communicationId}:`, error);
  }
}

function scheduleLifecycle(communicationId: string) {
  // 1. Send DELIVERED callback after 3 seconds (90% success rate, 10% failed)
  setTimeout(async () => {
    const delivered = Math.random() < 0.9;
    await sendCallback(communicationId, delivered ? "DELIVERED" : "FAILED");

    if (!delivered) return;

    // 2. Send OPENED callback after another 3 seconds (70% open rate)
    setTimeout(async () => {
      const opened = Math.random() < 0.7;
      if (!opened) return;
      await sendCallback(communicationId, "OPENED");

      // 3. Send CLICKED callback after another 3 seconds (25% click-through rate)
      setTimeout(async () => {
        const clicked = Math.random() < 0.25;
        if (!clicked) return;
        await sendCallback(communicationId, "CLICKED");
      }, 3000);
    }, 3000);
  }, 3000);
}

app.post("/send", async (req, res) => {
  const { communicationId } = req.body;

  if (!communicationId) {
    return res.status(400).json({
      error: "communicationId is required",
    });
  }

  scheduleLifecycle(communicationId);

  res.json({
    accepted: true,
  });
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
  console.log(`Channel Service running on ${PORT}`);
});
