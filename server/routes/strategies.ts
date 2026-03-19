import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStrategies: RequestHandler = async (req, res) => {
  try {
    const strategies = await prisma.strategy.findMany({
      include: {
        targets: true,
        _count: {
          select: {
            instances: true,
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(strategies);
  } catch (error) {
    console.error("Error fetching strategies:", error);
    res.status(500).json({ error: "Failed to fetch strategies" });
  }
};

export const getStrategy: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const strategy = await prisma.strategy.findUnique({
      where: { id },
      include: {
        targets: true,
        instances: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        attempts: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!strategy) {
      return res.status(404).json({ error: "Strategy not found" });
    }

    res.json(strategy);
  } catch (error) {
    console.error("Error fetching strategy:", error);
    res.status(500).json({ error: "Failed to fetch strategy" });
  }
};

export const createStrategy: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      description,
      imageType,
      shape,
      concurrencyLimit,
      maxRetries,
      targetInstances,
      timeoutSeconds,
      targets,
    } = req.body;

    // Validate required fields
    if (!name || !imageType || !shape) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const strategy = await prisma.strategy.create({
      data: {
        name,
        description,
        imageType,
        shape,
        concurrencyLimit: concurrencyLimit || 5,
        maxRetries: maxRetries || 3,
        targetInstances: targetInstances || 10,
        timeoutSeconds: timeoutSeconds || 300,
        status: "draft",
        targets: {
          create:
            targets?.map(
              (target: {
                region: string;
                availabilityDomain: string;
                subnet: string;
              }) => ({
                region: target.region,
                availabilityDomain: target.availabilityDomain,
                subnet: target.subnet,
              })
            ) || [],
        },
      },
      include: {
        targets: true,
      },
    });

    res.status(201).json(strategy);
  } catch (error) {
    console.error("Error creating strategy:", error);
    res.status(500).json({ error: "Failed to create strategy" });
  }
};

export const updateStrategy: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, concurrencyLimit, maxRetries } = req.body;

    const strategy = await prisma.strategy.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(concurrencyLimit && { concurrencyLimit }),
        ...(maxRetries && { maxRetries }),
      },
      include: {
        targets: true,
      },
    });

    res.json(strategy);
  } catch (error) {
    console.error("Error updating strategy:", error);
    res.status(500).json({ error: "Failed to update strategy" });
  }
};

export const startStrategy: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const strategy = await prisma.strategy.update({
      where: { id },
      data: { status: "active" },
      include: { targets: true },
    });

    // Trigger scheduler to pick up this strategy
    res.json({ message: "Strategy activated", strategy });
  } catch (error) {
    console.error("Error starting strategy:", error);
    res.status(500).json({ error: "Failed to start strategy" });
  }
};

export const stopStrategy: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const strategy = await prisma.strategy.update({
      where: { id },
      data: { status: "paused" },
    });

    res.json({ message: "Strategy paused", strategy });
  } catch (error) {
    console.error("Error stopping strategy:", error);
    res.status(500).json({ error: "Failed to stop strategy" });
  }
};

export const deleteStrategy: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.strategy.delete({
      where: { id },
    });

    res.json({ message: "Strategy deleted" });
  } catch (error) {
    console.error("Error deleting strategy:", error);
    res.status(500).json({ error: "Failed to delete strategy" });
  }
};
