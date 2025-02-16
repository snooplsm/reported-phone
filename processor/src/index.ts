import { subscribeToReports } from "./Api"

let activeSubscription: ReturnType<typeof subscribeToReports> | null = null;

function keepAlive() {
  setInterval(() => {
    console.log("🟢 Keeping process alive...");
  }, 1000 * 60 * 60); // Prevents Node.js from exiting (runs every hour)
}

// ✅ Start the WebSocket Subscription
activeSubscription = subscribeToReports(
  (data) => console.log("Received data:", data),
  (error) => console.error("Subscription error:", error)
);

// ✅ Keep the process alive
keepAlive();