import path from "path";
import { createServer } from "./index";
import { ProvisioningScheduler } from "./scheduler";
import { ProvisioningWorker } from "./worker";
import * as express from "express";
import { PrismaClient } from "@prisma/client";

const app = createServer();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

// Initialize scheduler and worker
const scheduler = new ProvisioningScheduler((app as any).broadcastToClients);
const worker = new ProvisioningWorker((app as any).broadcastToClients);

const httpServer = (app as any).httpServer;

httpServer.listen(port, async () => {
  console.log(`🚀 OCI Auto Provisioner server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${port}`);

  // Start background services
  try {
    // Initialize scheduler state
    await prisma.schedulerState.upsert({
      where: { id: "scheduler" },
      create: { id: "scheduler" },
      update: { isRunning: true },
    });

    console.log("✅ Scheduler state initialized");

    // Start scheduler (runs every 20 seconds)
    await scheduler.start();
    console.log("✅ Provisioning scheduler started");

    // Start worker (processes jobs)
    await worker.start();
    console.log("✅ Provisioning worker started");

    // Log startup
    await prisma.log.create({
      data: {
        level: "info",
        message: "OCI Auto Provisioner started",
        metadata: {
          version: "1.0.0",
          environment: process.env.NODE_ENV || "development",
        },
      },
    });
  } catch (error) {
    console.error("Error starting services:", error);
  }
});

// Graceful shutdown
let isShuttingDown = false;

const shutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("🛑 Shutting down gracefully...");

  try {
    // Stop scheduler and worker
    await scheduler.stop();
    console.log("✅ Scheduler stopped");

    await worker.stop();
    console.log("✅ Worker stopped");

    // Log shutdown
    await prisma.log.create({
      data: {
        level: "info",
        message: "OCI Auto Provisioner shut down",
      },
    });

    // Close database connection
    await prisma.$disconnect();
    console.log("✅ Database disconnected");
  } catch (error) {
    console.error("Error during shutdown:", error);
  }

  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
