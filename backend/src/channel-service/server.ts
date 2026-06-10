import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());

async function sendCallback(
  communicationId: string,
  status: "DELIVERED" | "OPENED" | "CLICKED" | "FAILED"
) {
  await axios.post(
    "http://localhost:5000/api/communications/callback",
    {
      communicationId,
      status,
    }
  );
}

function scheduleLifecycle(communicationId: string) {
  setTimeout(async () => {
    try {
      const delivered = Math.random() < 0.9;

      await sendCallback(
        communicationId,
        delivered ? "DELIVERED" : "FAILED"
      );

      if (!delivered) {
        return;
      }

      setTimeout(async () => {
        try {
          const opened = Math.random() < 0.7;

          if (!opened) {
            return;
          }

          await sendCallback(communicationId, "OPENED");

          setTimeout(async () => {
            try {
              const clicked = Math.random() < 0.25;

              if (!clicked) {
                return;
              }

              await sendCallback(communicationId, "CLICKED");
            } catch (error) {
              console.error("Failed to send CLICKED callback", error);
            }
          }, 3000);
        } catch (error) {
          console.error("Failed to send OPENED callback", error);
        }
      }, 3000);
    } catch (error) {
      console.error("Failed to send DELIVERED callback", error);
    }
  }, 3000);
}

app.post("/send", async (req, res) => {
  const { communicationId } = req.body;

  if (!communicationId) {
    return res.status(400).json({
      error: "communicationId is required",
    });
  }

  console.log(
    "Sending communication"
  );

  scheduleLifecycle(communicationId);

  res.json({
    accepted: true,
  });
});

app.listen(6000);