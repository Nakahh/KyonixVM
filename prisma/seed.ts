import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.log.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.instance.deleteMany({});
  await prisma.target.deleteMany({});
  await prisma.strategy.deleteMany({});
  await prisma.schedulerState.deleteMany({});

  console.log("✅ Cleared existing data");

  // Create example strategy
  const strategy = await prisma.strategy.create({
    data: {
      name: "Exemplo - São Paulo",
      description: "Estratégia de exemplo para a região de São Paulo",
      imageType: "ubuntu22",
      shape: "standard2",
      concurrencyLimit: 5,
      maxRetries: 3,
      targetInstances: 10,
      timeoutSeconds: 300,
      status: "draft",
      targets: {
        create: [
          {
            region: "sa-saopaulo-1",
            availabilityDomain: "sa-saopaulo-1:AD-1",
            subnet: "ocid1.subnet.oc1.sa-saopaulo-1...",
            priority: 1,
          },
          {
            region: "sa-saopaulo-1",
            availabilityDomain: "sa-saopaulo-1:AD-2",
            subnet: "ocid1.subnet.oc1.sa-saopaulo-1...",
            priority: 2,
          },
        ],
      },
    },
    include: {
      targets: true,
    },
  });

  console.log("✅ Created example strategy:", strategy.name);

  // Create scheduler state
  await prisma.schedulerState.create({
    data: {
      id: "scheduler",
      isRunning: false,
      currentCycleCount: 0,
    },
  });

  console.log("✅ Created scheduler state");

  // Log seed event
  await prisma.log.create({
    data: {
      level: "info",
      message: "Database seeded successfully",
      metadata: {
        strategiesCreated: 1,
        timestamp: new Date(),
      },
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Initial Setup:");
  console.log(`   • Strategies: 1 (draft)`);
  console.log(`   • Targets: 2 (São Paulo)`);
  console.log(`   • Ready to activate and start provisioning`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
