import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ProvisioningWorker {
  private isRunning = false;
  private workerInterval = 5000; // Check for jobs every 5 seconds
  private workerTimer: ReturnType<typeof setInterval> | null = null;
  private broadcastFn: ((event: string, data: any) => void) | null = null;

  constructor(broadcastFn?: (event: string, data: any) => void) {
    this.broadcastFn = broadcastFn || null;
  }

  async start() {
    if (this.isRunning) {
      console.log("Worker is already running");
      return;
    }

    console.log("Starting provisioning worker...");
    this.isRunning = true;

    // Process jobs continuously
    this.workerTimer = setInterval(() => {
      this.processJobs().catch((error) => {
        console.error("Error in worker:", error);
      });
    }, this.workerInterval);

    // Run first check immediately
    await this.processJobs();
  }

  async stop() {
    if (!this.isRunning) return;

    console.log("Stopping provisioning worker...");
    this.isRunning = false;

    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
    }
  }

  private async processJobs() {
    try {
      // Get pending attempts
      const pendingAttempts = await prisma.attempt.findMany({
        where: { status: "pending" },
        include: {
          strategy: true,
          target: true,
        },
        take: 10, // Process up to 10 jobs at a time
      });

      if (pendingAttempts.length === 0) {
        return;
      }

      console.log(
        `Worker: Processing ${pendingAttempts.length} pending attempts`
      );

      for (const attempt of pendingAttempts) {
        await this.processAttempt(attempt);
      }
    } catch (error) {
      console.error("Error processing jobs:", error);
    }
  }

  private async processAttempt(attempt: any) {
    try {
      console.log(`Worker: Processing attempt ${attempt.id}`);

      // Update attempt to in_progress
      await prisma.attempt.update({
        where: { id: attempt.id },
        data: { status: "in_progress" },
      });

      this.broadcast("attempt:started", {
        attemptId: attempt.id,
        strategyId: attempt.strategyId,
        targetId: attempt.targetId,
      });

      // Simulate OCI API call with random delay
      await this.simulateOCICall(attempt);

      // Get updated instance
      const instance = await prisma.instance.findFirst({
        where: { requestId: attempt.requestId },
      });

      // Randomly succeed (80%) or fail (20%) for simulation
      const success = Math.random() > 0.2;

      if (success) {
        console.log(`Worker: Attempt ${attempt.id} succeeded`);

        // Update attempt
        await prisma.attempt.update({
          where: { id: attempt.id },
          data: { status: "success" },
        });

        // Update instance
        await prisma.instance.update({
          where: { id: instance!.id },
          data: {
            status: "running",
            ociId: `ocid1.instance.oc1.${Date.now()}.${Math.random().toString(36).substring(7)}`,
          },
        });

        this.broadcast("attempt:success", {
          attemptId: attempt.id,
          instanceId: instance!.id,
          instanceName: instance!.name,
          strategyId: attempt.strategyId,
        });

        await prisma.log.create({
          data: {
            level: "info",
            message: `Instance created successfully: ${instance!.name}`,
            metadata: {
              instanceId: instance!.id,
              strategyId: attempt.strategyId,
            },
          },
        });
      } else {
        console.log(
          `Worker: Attempt ${attempt.id} failed (retries: ${attempt.retryCount})`
        );

        const maxRetries = attempt.strategy?.maxRetries || 3;

        if (attempt.retryCount < maxRetries) {
          // Schedule retry
          await prisma.attempt.update({
            where: { id: attempt.id },
            data: {
              status: "pending",
              retryCount: attempt.retryCount + 1,
            },
          });

          this.broadcast("attempt:retry_scheduled", {
            attemptId: attempt.id,
            retryCount: attempt.retryCount + 1,
            maxRetries,
            strategyId: attempt.strategyId,
          });

          await prisma.log.create({
            data: {
              level: "warn",
              message: `Attempt failed, retry scheduled (${attempt.retryCount + 1}/${maxRetries})`,
              metadata: {
                attemptId: attempt.id,
                strategyId: attempt.strategyId,
              },
            },
          });
        } else {
          // Mark as failed
          await prisma.attempt.update({
            where: { id: attempt.id },
            data: { status: "error", errorMessage: "Max retries exceeded" },
          });

          // Update instance
          await prisma.instance.update({
            where: { id: instance!.id },
            data: { status: "failed" },
          });

          this.broadcast("attempt:failed", {
            attemptId: attempt.id,
            instanceId: instance!.id,
            strategyId: attempt.strategyId,
            reason: "Max retries exceeded",
          });

          await prisma.log.create({
            data: {
              level: "error",
              message: `Instance creation failed after ${maxRetries} retries: ${instance!.name}`,
              metadata: {
                instanceId: instance!.id,
                attemptId: attempt.id,
                strategyId: attempt.strategyId,
              },
            },
          });
        }
      }
    } catch (error) {
      console.error(`Worker: Error processing attempt ${attempt.id}:`, error);

      // Log error
      await prisma.log.create({
        data: {
          level: "error",
          message: `Worker error processing attempt`,
          metadata: {
            attemptId: attempt.id,
            error: error instanceof Error ? error.message : String(error),
          },
        },
      });
    }
  }

  private async simulateOCICall(attempt: any): Promise<void> {
    // Simulate API call delay
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private broadcast(event: string, data: any) {
    if (this.broadcastFn) {
      this.broadcastFn(event, data);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      workerInterval: this.workerInterval,
    };
  }
}
