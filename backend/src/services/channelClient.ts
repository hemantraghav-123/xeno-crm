import axios from "axios";

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || "http://localhost:6001";

export async function sendToChannel(payload: any) {
  const res = await axios.post(`${CHANNEL_SERVICE_URL}/send`, payload);
  return res.data;
}