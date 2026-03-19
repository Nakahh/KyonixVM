import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import * as strategiesRoute from "./routes/strategies";
import * as instancesRoute from "./routes/instances";
import * as logsRoute from "./routes/logs";
import { createServer as createHttpServer } from "http";
import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  // WebSocket connection handling
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log("WebSocket message:", message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // Export broadcast function for use in other modules
  (app as any).broadcastToClients = (event: string, data: any) => {
    const message = JSON.stringify({ event, data, timestamp: new Date() });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        // OPEN
        client.send(message);
      }
    });
  };

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Strategies API
  app.get("/api/strategies", strategiesRoute.getStrategies);
  app.get("/api/strategies/:id", strategiesRoute.getStrategy);
  app.post("/api/strategies", strategiesRoute.createStrategy);
  app.patch("/api/strategies/:id", strategiesRoute.updateStrategy);
  app.patch("/api/strategies/:id/start", strategiesRoute.startStrategy);
  app.patch("/api/strategies/:id/stop", strategiesRoute.stopStrategy);
  app.delete("/api/strategies/:id", strategiesRoute.deleteStrategy);

  // Instances API
  app.get("/api/instances", instancesRoute.getInstances);
  app.get("/api/instances/:id", instancesRoute.getInstance);
  app.post("/api/instances", instancesRoute.createInstance);
  app.patch("/api/instances/:id", instancesRoute.updateInstanceStatus);
  app.delete("/api/instances/:id", instancesRoute.terminateInstance);
  app.get("/api/instances-stats", instancesRoute.getInstanceStats);

  // Logs and Monitoring API
  app.get("/api/logs", logsRoute.getLogs);
  app.post("/api/logs", logsRoute.createLog);
  app.get("/api/metrics", logsRoute.getMetrics);
  app.get("/api/attempts-stats", logsRoute.getAttemptStats);

  // Error handling middleware
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("Unhandled error:", err);
      res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  );

  // Store httpServer for use in node-build.ts
  (app as any).httpServer = httpServer;
  (app as any).prisma = prisma;
  (app as any).wss = wss;

  return app;
}
