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
    // Clean existing database to prevent any unique constraint collisions
    console.log("Cleaning existing database tables (respecting foreign key order)...");
    await prisma.donation.deleteMany({});
    await prisma.volunteerApplication.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.campaign.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.blogPost.deleteMany({});
    await prisma.testimonial.deleteMany({});
    await prisma.galleryImage.deleteMany({});
    await prisma.teamMember.deleteMany({});
    await prisma.partner.deleteMany({});
    await prisma.newsletterSubscriber.deleteMany({});
    await prisma.auditLog.deleteMany({});
    console.log("✅ Database tables cleared successfully!");

    // 1. Import Independent Tables
    if (data.User) {
      console.log(`Importing ${data.User.length} Users...`);
      for (const record of data.User) {
        await prisma.user.create({
          data: record,
        });
      }
    }

    if (data.Campaign) {
      console.log(`Importing ${data.Campaign.length} Campaigns...`);
      for (const record of data.Campaign) {
        await prisma.campaign.create({
          data: {
            ...record,
            deadline: record.deadline ? new Date(record.deadline) : null,
          },
        });
      }
    }

    if (data.Event) {
      console.log(`Importing ${data.Event.length} Events...`);
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
        await prisma.blogPost.create({
          data: record,
        });
      }
    }

    if (data.Testimonial) {
      console.log(`Importing ${data.Testimonial.length} Testimonials...`);
      for (const record of data.Testimonial) {
        await prisma.testimonial.create({
          data: record,
        });
      }
    }

    if (data.GalleryImage) {
      console.log(`Importing ${data.GalleryImage.length} Gallery Images...`);
      for (const record of data.GalleryImage) {
        await prisma.galleryImage.create({
          data: record,
        });
      }
    }

    if (data.TeamMember) {
      console.log(`Importing ${data.TeamMember.length} Team Members...`);
      for (const record of data.TeamMember) {
        await prisma.teamMember.create({
          data: record,
        });
      }
    }

    if (data.Partner) {
      console.log(`Importing ${data.Partner.length} Partners...`);
      for (const record of data.Partner) {
        await prisma.partner.create({
          data: record,
        });
      }
    }

    if (data.NewsletterSubscriber) {
      console.log(`Importing ${data.NewsletterSubscriber.length} Newsletter Subscribers...`);
      for (const record of data.NewsletterSubscriber) {
        await prisma.newsletterSubscriber.create({
          data: record,
        });
      }
    }

    if (data.AuditLog) {
      console.log(`Importing ${data.AuditLog.length} Audit Logs...`);
      for (const record of data.AuditLog) {
        await prisma.auditLog.create({
          data: record,
        });
      }
    }

    // 2. Import Dependent Tables (with foreign keys)
    if (data.VolunteerApplication) {
      console.log(`Importing ${data.VolunteerApplication.length} Volunteer Applications...`);
      for (const record of data.VolunteerApplication) {
        await prisma.volunteerApplication.create({
          data: record,
        });
      }
    }

    if (data.Donation) {
      console.log(`Importing ${data.Donation.length} Donations...`);
      for (const record of data.Donation) {
        await prisma.donation.create({
          data: record,
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
