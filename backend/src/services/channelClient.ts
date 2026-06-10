export async function sendToChannel(payload: any) {
  const res = await fetch("http://localhost:6000/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Channel send failed: ${res.status} ${text}`);
  }

  return res.json();
}