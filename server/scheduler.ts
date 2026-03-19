import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ProvisioningScheduler {
  private isRunning = false;
  private cycleInterval = 20000; // 20 seconds
  private cycleTimer: ReturnType<typeof setInterval> | null = null;
  private cycleCount = 0;
  private broadcastFn: ((event: string, data: any) => void) | null = null;

  constructor(broadcastFn?: (event: string, data: any) => void) {
    this.broadcastFn = broadcastFn || null;
  }

  async start() {
    if (this.isRunning) {
      console.log("Scheduler is already running");
      return;
    }

    console.log("Starting provisioning scheduler...");
    this.isRunning = true;

    // Run first cycle immediately
    await this.runCycle();

    // Then set up recurring cycles
    this.cycleTimer = setInterval(() => {
      this.runCycle().catch((error) => {
        console.error("Error in scheduler cycle:", error);
      });
    }, this.cycleInterval);
  }

  async stop() {
    if (!this.isRunning) return;

    console.log("Stopping provisioning scheduler...");
    this.isRunning = false;

    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
  }

  private async runCycle() {
    const cycleStartTime = Date.now();
    this.cycleCount++;

    console.log(
      `[Cycle ${this.cycleCount}] Starting provisioning cycle at ${new Date().toISOString()}`
    );

    try {
      // Broadcast cycle start
      this.broadcast("cycle:started", {
        cycleNumber: this.cycleCount,
        timestamp: new Date(),
      });

      // Get all active strategies
      const activeStrategies = await prisma.strategy.findMany({
        where: { status: "active" },
        include: {
          targets: {
            orderBy: { priority: "desc" },
          },
        },
      });

      if (activeStrategies.length === 0) {
        console.log(`[Cycle ${this.cycleCount}] No active strategies found`);
        this.broadcast("cycle:completed", {
          cycleNumber: this.cycleCount,
          strategiesProcessed: 0,
          timestamp: new Date(),
        });
        return;
      }

      let totalJobsCreated = 0;

      // Process each strategy
      for (const strategy of activeStrategies) {
        console.log(
          `[Cycle ${this.cycleCount}] Processing strategy: ${strategy.name}`
        );

        // Get current instance count
        const currentCount = await prisma.instance.count({
          where: {
            strategyId: strategy.id,
            status: { in: ["pending", "creating", "running"] },
          },
        });

        const remaining = Math.max(0, strategy.targetInstances - currentCount);

        if (remaining === 0) {
          console.log(
            `[Cycle ${this.cycleCount}] Strategy ${strategy.name} has reached target (${currentCount}/${strategy.targetInstances})`
          );
          continue;
        }

        // Determine how many jobs to create this cycle
        const jobsToCreate = Math.min(remaining, strategy.concurrencyLimit);

        console.log(
          `[Cycle ${this.cycleCount}] Creating ${jobsToCreate} instances for strategy ${strategy.name} (${currentCount}/${strategy.targetInstances})`
        );

        // Create attempts for each job
        for (let i = 0; i < jobsToCreate; i++) {
          try {
            const target = strategy.targets[i % strategy.targets.length];
            const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const instanceName = `${strategy.name
              .toLowerCase()
              .replace(/\s+/g, "-")}-${Date.now()}-${i}`;

            // Create instance record
            const instance = await prisma.instance.create({
              data: {
                name: instanceName,
                region: target.region,
                strategyId: strategy.id,
                requestId,
                status: "pending",
              },
            });

            // Create attempt record
            await prisma.attempt.create({
              data: {
                strategyId: strategy.id,
                targetId: target.id,
                requestId,
                status: "pending",
                retryCount: 0,
              },
            });

            totalJobsCreated++;

            this.broadcast("job:created", {
              instanceId: instance.id,
              instanceName: instance.name,
              strategyId: strategy.id,
              region: target.region,
            });

            console.log(
              `[Cycle ${this.cycleCount}] Created job for instance: ${instanceName}`
            );
          } catch (error) {
            console.error(
              `[Cycle ${this.cycleCount}] Error creating job:`,
              error
            );
          }
        }
      }

      // Update scheduler state
      await prisma.schedulerState.upsert({
        where: { id: "scheduler" },
        create: {
          id: "scheduler",
          lastCycleAt: new Date(),
          nextCycleAt: new Date(Date.now() + this.cycleInterval),
          currentCycleCount: this.cycleCount,
        },
        update: {
          lastCycleAt: new Date(),
          nextCycleAt: new Date(Date.now() + this.cycleInterval),
          currentCycleCount: this.cycleCount,
        },
      });

      const cycleTime = Date.now() - cycleStartTime;
      console.log(
        `[Cycle ${this.cycleCount}] Completed in ${cycleTime}ms (${totalJobsCreated} jobs created)`
      );

      this.broadcast("cycle:completed", {
        cycleNumber: this.cycleCount,
        jobsCreated: totalJobsCreated,
        strategiesProcessed: activeStrategies.length,
        duration: cycleTime,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`[Cycle ${this.cycleCount}] Scheduler error:`, error);

      this.broadcast("cycle:error", {
        cycleNumber: this.cycleCount,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      // Log error to database
      await prisma.log.create({
        data: {
          level: "error",
          message: `Scheduler cycle ${this.cycleCount} failed`,
          metadata: {
            cycleNumber: this.cycleCount,
            error: error instanceof Error ? error.message : String(error),
          },
        },
      });
    }
  }

  private broadcast(event: string, data: any) {
    if (this.broadcastFn) {
      this.broadcastFn(event, data);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      cycleCount: this.cycleCount,
      nextCycleInterval: this.cycleInterval,
    };
  }
}
