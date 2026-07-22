const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database export from local PostgreSQL...");
  const data = {};

  try {
    data.User = await prisma.user.findMany();
    console.log(`✓ Exported ${data.User.length} Users`);

    data.Campaign = await prisma.campaign.findMany();
    console.log(`✓ Exported ${data.Campaign.length} Campaigns`);

    data.Event = await prisma.event.findMany();
    console.log(`✓ Exported ${data.Event.length} Events`);

    data.BlogPost = await prisma.blogPost.findMany();
    console.log(`✓ Exported ${data.BlogPost.length} Blog Posts`);

    data.Testimonial = await prisma.testimonial.findMany();
    console.log(`✓ Exported ${data.Testimonial.length} Testimonials`);

    data.GalleryImage = await prisma.galleryImage.findMany();
    console.log(`✓ Exported ${data.GalleryImage.length} Gallery Images`);

    data.TeamMember = await prisma.teamMember.findMany();
    console.log(`✓ Exported ${data.TeamMember.length} Team Members`);

    data.Partner = await prisma.partner.findMany();
    console.log(`✓ Exported ${data.Partner.length} Partners`);

    data.NewsletterSubscriber = await prisma.newsletterSubscriber.findMany();
    console.log(`✓ Exported ${data.NewsletterSubscriber.length} Newsletter Subscribers`);

    data.VolunteerApplication = await prisma.volunteerApplication.findMany();
    console.log(`✓ Exported ${data.VolunteerApplication.length} Volunteer Applications`);

    data.Donation = await prisma.donation.findMany();
    console.log(`✓ Exported ${data.Donation.length} Donations`);

    data.AuditLog = await prisma.auditLog.findMany();
    console.log(`✓ Exported ${data.AuditLog.length} Audit Logs`);

    const backupPath = path.join(process.cwd(), "db-backup.json");
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`\n🎉 Local database exported successfully to: ${backupPath}`);
  } catch (error) {
    console.error("❌ Export failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
