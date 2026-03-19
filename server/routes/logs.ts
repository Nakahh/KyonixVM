import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLogs: RequestHandler = async (req, res) => {
  try {
    const { level, limit = "100", offset = "0" } = req.query;

    const where = level ? { level: level as string } : {};
    const take = Math.min(parseInt(limit as string), 1000);
    const skip = parseInt(offset as string);

    const logs = await prisma.log.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take,
      skip,
    });

    const total = await prisma.log.count({ where });

    res.json({
      data: logs,
      pagination: {
        total,
        limit: take,
        offset: skip,
      },
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

export const createLog: RequestHandler = async (req, res) => {
  try {
    const { level, message, metadata } = req.body;

    const log = await prisma.log.create({
      data: {
        level: level || "info",
        message,
        metadata,
      },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error("Error creating log:", error);
    res.status(500).json({ error: "Failed to create log" });
  }
};

export const getMetrics: RequestHandler = async (req, res) => {
  try {
    const [
      totalStrategies,
      activeStrategies,
      totalInstances,
      successfulInstances,
      failedInstances,
      recentErrors,
    ] = await Promise.all([
      prisma.strategy.count(),
      prisma.strategy.count({ where: { status: "active" } }),
      prisma.instance.count(),
      prisma.instance.count({ where: { status: "running" } }),
      prisma.instance.count({ where: { status: "failed" } }),
      prisma.log.count({
        where: { level: "error" },
      }),
    ]);

    const successRate =
      totalInstances > 0
        ? (
            ((successfulInstances + totalInstances - failedInstances) /
              totalInstances) *
            100
          ).toFixed(2)
        : "0.00";

    // Get hourly stats for the last 24 hours
    const last24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hourlyStats = [];

    for (let i = 0; i < 24; i++) {
      const hour = new Date(Date.now() - i * 60 * 60 * 1000);
      const nextHour = new Date(hour.getTime() + 60 * 60 * 1000);

      const count = await prisma.instance.count({
        where: {
          status: "running",
          createdAt: {
            gte: hour,
            lt: nextHour,
          },
        },
      });

      hourlyStats.unshift({
        time: hour.toISOString(),
        count,
      });
    }

    res.json({
      strategies: {
        total: totalStrategies,
        active: activeStrategies,
      },
      instances: {
        total: totalInstances,
        successful: successfulInstances,
        failed: failedInstances,
        successRate: parseFloat(successRate),
      },
      errors: {
        recent: recentErrors,
      },
      timeline: hourlyStats,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};

export const getAttemptStats: RequestHandler = async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      select: {
        retryCount: true,
        status: true,
      },
    });

    const statsByRetry: Record<string, { success: number; failed: number }> =
      {};

    attempts.forEach((attempt) => {
      const retryKey = `${attempt.retryCount + 1}`;
      if (!statsByRetry[retryKey]) {
        statsByRetry[retryKey] = { success: 0, failed: 0 };
      }

      if (attempt.status === "success") {
        statsByRetry[retryKey].success++;
      } else {
        statsByRetry[retryKey].failed++;
      }
    });

    res.json(statsByRetry);
  } catch (error) {
    console.error("Error fetching attempt stats:", error);
    res.status(500).json({ error: "Failed to fetch attempt stats" });
  }
};
