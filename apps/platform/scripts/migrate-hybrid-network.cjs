const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...values] = trimmed.split("=");
        const val = values.join("=").replace(/^["']|["']$/g, "").trim();
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

loadEnvFile(path.resolve(__dirname, "../.env.local"));
loadEnvFile(path.resolve(__dirname, "../.env"));
loadEnvFile(path.resolve(__dirname, "../../.env.local"));
loadEnvFile(path.resolve(__dirname, "../../.env"));

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== HYBRID NETWORK MIGRATION ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    const accepted = await prisma.userConnection.findMany({
      where: { status: "accepted" },
      include: {
        recipient: { select: { specialistProfile: { select: { userId: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const pairKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);
    const byPair = new Map();

    for (const conn of accepted) {
      const key = pairKey(conn.requesterId, conn.recipientId);
      if (!byPair.has(key)) byPair.set(key, []);
      byPair.get(key).push(conn);
    }

    let migratedToFollow = 0;
    let deduplicatedMutual = 0;

    for (const [, rows] of byPair.entries()) {
      if (rows.length === 1) {
        const [only] = rows;
        const recipientIsSpecialist = Boolean(only.recipient?.specialistProfile);
        if (recipientIsSpecialist) {
          await prisma.userFollow.upsert({
            where: {
              followerId_followingId: {
                followerId: only.requesterId,
                followingId: only.recipientId,
              },
            },
            create: {
              followerId: only.requesterId,
              followingId: only.recipientId,
              createdAt: only.createdAt,
            },
            update: {},
          });
          await prisma.userConnection.delete({ where: { id: only.id } });
          migratedToFollow++;
        }
        // Regular member 1-way rows are grandfathered as mutual contacts
      } else if (rows.length > 1) {
        // Mutual pair: keep the newest row, remove redundant reverse row
        const [, ...duplicates] = rows;
        await prisma.userConnection.deleteMany({
          where: { id: { in: duplicates.map((d) => d.id) } },
        });
        deduplicatedMutual += duplicates.length;
      }
    }

    console.log(`Migrated 1-way specialist connections to UserFollow: ${migratedToFollow}`);
    console.log(`Deduplicated mutual UserConnection pairs: ${deduplicatedMutual}`);
    console.log("=== MIGRATION COMPLETE ===");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
