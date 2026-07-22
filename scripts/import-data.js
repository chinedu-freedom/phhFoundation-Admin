const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const backupPath = path.join(process.cwd(), "db-backup.json");
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup file not found at: ${backupPath}`);
    process.exit(1);
  }

  console.log("Starting database import on VPS...");
  const data = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

  try {
    // 1. Import Independent Tables
    if (data.User) {
      console.log(`Importing ${data.User.length} Users...`);
      for (const record of data.User) {
        await prisma.user.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    if (data.Campaign) {
      console.log(`Importing ${data.Campaign.length} Campaigns...`);
      for (const record of data.Campaign) {
        await prisma.campaign.upsert({
          where: { id: record.id },
          update: {
            ...record,
            deadline: record.deadline ? new Date(record.deadline) : null,
          },
          create: {
            ...record,
            deadline: record.deadline ? new Date(record.deadline) : null,
          },
        });
      }
    }

    if (data.Event) {
      console.log(`Importing ${data.Event.length} Events...`);
      // Delete existing to prevent collisions with clean slate
      await prisma.event.deleteMany({});
      for (const record of data.Event) {
        await prisma.event.create({
          data: {
            ...record,
            date: new Date(record.date),
          },
        });
      }
    }

    if (data.BlogPost) {
      console.log(`Importing ${data.BlogPost.length} Blog Posts...`);
      for (const record of data.BlogPost) {
        await prisma.blogPost.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    if (data.Testimonial) {
      console.log(`Importing ${data.Testimonial.length} Testimonials...`);
      for (const record of data.Testimonial) {
        await prisma.testimonial.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    if (data.GalleryImage) {
      console.log(`Importing ${data.GalleryImage.length} Gallery Images...`);
      for (const record of data.GalleryImage) {
        await prisma.galleryImage.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    if (data.TeamMember) {
      console.log(`Importing ${data.TeamMember.length} Team Members...`);
      for (const record of data.TeamMember) {
        await prisma.teamMember.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    if (data.Partner) {
      console.log(`Importing ${data.Partner.length} Partners...`);
      for (const record of data.Partner) {
        await prisma.partner.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    if (data.NewsletterSubscriber) {
      console.log(`Importing ${data.NewsletterSubscriber.length} Newsletter Subscribers...`);
      for (const record of data.NewsletterSubscriber) {
        await prisma.newsletterSubscriber.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    if (data.AuditLog) {
      console.log(`Importing ${data.AuditLog.length} Audit Logs...`);
      for (const record of data.AuditLog) {
        await prisma.auditLog.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    // 2. Import Dependent Tables (with foreign keys)
    if (data.VolunteerApplication) {
      console.log(`Importing ${data.VolunteerApplication.length} Volunteer Applications...`);
      for (const record of data.VolunteerApplication) {
        await prisma.volunteerApplication.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    if (data.Donation) {
      console.log(`Importing ${data.Donation.length} Donations...`);
      for (const record of data.Donation) {
        await prisma.donation.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      }
    }

    console.log("\n🎉 Database restoration completed successfully on the VPS!");
  } catch (error) {
    console.error("❌ Import failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
