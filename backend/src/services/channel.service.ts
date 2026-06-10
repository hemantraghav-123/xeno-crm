export async function simulateDelivery() {
  const random = Math.random();

  if (random < 0.8)
    return "DELIVERED";

  return "FAILED";
}