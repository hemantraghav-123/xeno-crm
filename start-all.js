const { spawn, execSync } = require("child_process");
const path = require("path");

const backendPort = process.env.PORT || "5000";
const channelPort = "6001";

console.log("=== Node.js Monorepo Orchestrator Starting ===");
console.log(`Backend config: listening on PORT ${backendPort}`);
console.log(`Channel-service config: listening on PORT ${channelPort}`);

// 1. Run database migrations for backend
console.log("\n[1/3] Running database migrations...");
try {
  execSync("node prisma-migrate.js", {
    cwd: path.join(__dirname, "backend"),
    stdio: "inherit",
    env: { ...process.env, PORT: backendPort }
  });
  console.log("Database migrations completed successfully.");
} catch (error) {
  console.error("Database migrations failed:", error);
  process.exit(1);
}

// 2. Start the Backend service
console.log("\n[2/3] Starting backend service...");
const backend = spawn("node", ["dist/server.js"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: backendPort,
    CHANNEL_SERVICE_URL: `http://localhost:${channelPort}`
  }
});

// 3. Start the Channel service
console.log("\n[3/3] Starting channel-service...");
const channel = spawn("node", ["dist/server.js"], {
  cwd: path.join(__dirname, "channel-service"),
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: channelPort,
    BACKEND_URL: `http://localhost:${backendPort}`
  }
});

// Error handling & shutdown orchestration
backend.on("exit", (code) => {
  console.log(`Backend service exited with code ${code}. Terminating orchestration.`);
  channel.kill();
  process.exit(code || 0);
});

channel.on("exit", (code) => {
  console.log(`Channel service exited with code ${code}. Terminating orchestration.`);
  backend.kill();
  process.exit(code || 0);
});

// Capture Ctrl+C / SIGINT signals and terminate child processes cleanly
process.on("SIGINT", () => {
  console.log("\nShutting down services...");
  backend.kill("SIGINT");
  channel.kill("SIGINT");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("\nShutting down services...");
  backend.kill("SIGTERM");
  channel.kill("SIGTERM");
  process.exit(0);
});
