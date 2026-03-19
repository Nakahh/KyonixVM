import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getInstances: RequestHandler = async (req, res) => {
  try {
    const { strategyId, status, region } = req.query;

    const where: any = {};
    if (strategyId) where.strategyId = strategyId as string;
    if (status) where.status = status as string;
    if (region) where.region = region as string;

    const instances = await prisma.instance.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json(instances);
  } catch (error) {
    console.error("Error fetching instances:", error);
    res.status(500).json({ error: "Failed to fetch instances" });
  }
};

export const getInstance: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await prisma.instance.findUnique({
      where: { id },
    });

    if (!instance) {
      return res.status(404).json({ error: "Instance not found" });
    }

    res.json(instance);
  } catch (error) {
    console.error("Error fetching instance:", error);
    res.status(500).json({ error: "Failed to fetch instance" });
  }
};

export const createInstance: RequestHandler = async (req, res) => {
  try {
    const { name, region, strategyId, ociId, requestId } = req.body;

    if (!name || !region || !strategyId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const instance = await prisma.instance.create({
      data: {
        name,
        region,
        strategyId,
        ociId,
        requestId: requestId || `req-${Date.now()}`,
        status: "pending",
      },
    });

    res.status(201).json(instance);
  } catch (error) {
    console.error("Error creating instance:", error);
    res.status(500).json({ error: "Failed to create instance" });
  }
};

export const updateInstanceStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ociId, errorMessage } = req.body;

    const instance = await prisma.instance.update({
      where: { id },
      data: {
        status,
        ...(ociId && { ociId }),
        ...(errorMessage && { status: "failed" }),
      },
    });

    res.json(instance);
  } catch (error) {
    console.error("Error updating instance:", error);
    res.status(500).json({ error: "Failed to update instance" });
  }
};

export const terminateInstance: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await prisma.instance.update({
      where: { id },
      data: { status: "terminated" },
    });

    res.json(instance);
  } catch (error) {
    console.error("Error terminating instance:", error);
    res.status(500).json({ error: "Failed to terminate instance" });
  }
};

export const getInstanceStats: RequestHandler = async (req, res) => {
  try {
    const { strategyId } = req.query;

    const where = strategyId ? { strategyId: strategyId as string } : {};

    const [total, running, failed, pending] = await Promise.all([
      prisma.instance.count({ where }),
      prisma.instance.count({ where: { ...where, status: "running" } }),
      prisma.instance.count({ where: { ...where, status: "failed" } }),
      prisma.instance.count({ where: { ...where, status: "pending" } }),
    ]);

    const successRate =
      total > 0 ? ((running / total) * 100).toFixed(1) : "0.0";

    res.json({
      total,
      running,
      failed,
      pending,
      successRate: parseFloat(successRate as string),
    });
  } catch (error) {
    console.error("Error fetching instance stats:", error);
    res.status(500).json({ error: "Failed to fetch instance stats" });
  }
};
