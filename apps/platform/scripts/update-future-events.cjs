const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

// Read .env.local or .env from apps/platform
const envPath = fs.existsSync(path.resolve(__dirname, "../.env.local"))
  ? path.resolve(__dirname, "../.env.local")
  : path.resolve(__dirname, "../.env");

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const allEvents = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log(`Found ${allEvents.length} events in DB.`);
    if (allEvents.length === 0) {
      console.log("No events found in database.");
      return;
    }

    // Pick 2 events to update to future dates
    const event1 = allEvents[0];
    const event2 = allEvents[1] || allEvents[0];

    // Event 1 -> Saturday 14 Nov 2026, 18:00 hs GMT-3
    const futureDate1 = new Date("2026-11-14T21:00:00.000Z");
    const updated1 = await prisma.event.update({
      where: { id: event1.id },
      data: {
        date: futureDate1,
        timeText: "18:00 hs",
        isUpcoming: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        date: true,
        timeText: true,
        isUpcoming: true,
      },
    });
    console.log("Updated Event 1 to future:", updated1);

    if (allEvents.length > 1) {
      // Event 2 -> Saturday 21 Nov 2026, 18:00 hs GMT-3
      const futureDate2 = new Date("2026-11-21T21:00:00.000Z");
      const updated2 = await prisma.event.update({
        where: { id: event2.id },
        data: {
          date: futureDate2,
          timeText: "18:00 hs",
          isUpcoming: true,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          date: true,
          timeText: true,
          isUpcoming: true,
        },
      });
      console.log("Updated Event 2 to future:", updated2);
    }
  } catch (err) {
    console.error("Error updating events in DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
