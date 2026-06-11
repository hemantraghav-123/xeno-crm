import axios from "axios";

export async function sendToChannel(payload: any) {
  const res = await axios.post("http://localhost:6001/send", payload);
  return res.data;
}