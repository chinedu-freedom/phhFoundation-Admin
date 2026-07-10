const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Create Admin User
  const adminEmail = "admin@hhfoundation.org";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "HH Foundation",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Created admin user: admin@hhfoundation.org / admin123");
  } else {
    console.log("Admin user already exists");
  }

  // 2. Create Campaigns
  const campaigns = [
    {
      title: "Education for Every Child",
      slug: "education-for-every-child",
      description: "Support marginalized children in rural communities with school fees, textbooks, uniforms, and learning materials to ensure they stay in school.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60",
      targetAmount: 10000000,
      raisedAmount: 4200000,
      status: "ACTIVE",
    },
    {
      title: "Rural Health & Medical Outreach",
      slug: "rural-health-medical-outreach",
      description: "Providing free general consultations, basic surgeries, maternal care, eye exams, and clean prescription medicines to rural towns with limited healthcare access.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
      targetAmount: 15000000,
      raisedAmount: 8500000,
      status: "ACTIVE",
    },
    {
      title: "Skill Acquisition & Economic Empowerment for Women",
      slug: "skill-acquisition-women",
      description: "Empowering widows and young women with tailoring, catering, computer literacy, and soap-making skills, including start-up grants and equipment.",
      image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=60",
      targetAmount: 5000000,
      raisedAmount: 1800000,
      status: "ACTIVE",
    },
    {
      title: "Food Support Program for Vulnerable Families",
      slug: "food-support-program",
      description: "Distributing food packs containing rice, beans, cooking oil, and basic nutritional supplies to low-income families and elderly community members.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60",
      targetAmount: 3000000,
      raisedAmount: 1200000,
      status: "ACTIVE",
    },
  ];

  for (const c of campaigns) {
    await prisma.campaign.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log("Seeded campaigns");

  // 3. Create Events
  const events = [
    {
      title: "Annual Charity Gala & Dinner",
      description: "Join us for our annual fundraising gala to celebrate our achievements and raise funds for upcoming humanitarian and educational projects.",
      date: new Date("2026-12-15T18:00:00Z"),
      venue: "Grand Royal Hall, Lagos",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60",
      registrationRequired: true,
      attendeesCount: 120,
      status: "UPCOMING",
    },
    {
      title: "Youth Tech Bootcamp",
      description: "A free 2-week intensive programming and web design workshop for teenagers from underserved neighborhoods.",
      date: new Date("2026-08-10T09:00:00Z"),
      venue: "HH Innovation Center, Port Harcourt",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60",
      registrationRequired: true,
      attendeesCount: 45,
      status: "UPCOMING",
    },
    {
      title: "World Health Day Outreach",
      description: "Free checkups and diabetes screenings for rural community residents.",
      date: new Date("2026-04-07T08:00:00Z"),
      venue: "Owerri Community Square",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60",
      registrationRequired: false,
      attendeesCount: 250,
      status: "PAST",
    },
  ];

  // We delete upcoming to avoid duplicates on multiple runs, or we can just create them
  await prisma.event.deleteMany({});
  for (const e of events) {
    await prisma.event.create({ data: e });
  }
  console.log("Seeded events");

  // 4. Create Blog Posts
  const posts = [
    {
      title: "Transforming Lives Through Digital Education",
      slug: "transforming-lives-digital-education",
      content: "Education is the most powerful weapon which you can use to change the world. In today's digital era, computer literacy is no longer optional. At HH Foundation, we believe every child deserves access to tech education. Our recent bootcamp empowered 50 students with coding skills, opening new doors of opportunities. We are building a modern computer laboratory to make this learning continuous. Supporting this campaign can change a child's future forever.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
      category: "Education",
      authorName: "Sarah Johnson",
      authorEmail: "sarah.j@hhfoundation.org",
      status: "PUBLISHED",
    },
    {
      title: "Overcoming Healthcare Challenges in Rural Communities",
      slug: "overcoming-healthcare-challenges-rural",
      content: "Lack of basic medical services remains a major challenge in rural Nigeria. During our recent health outreach in Enugu, we treated over 800 patients, diagnosing and treating malaria, hypertension, and vision problems. Many of these families had not seen a doctor in years. We are working on establishing permanent mobile clinics to provide consistent health services. Healthcare is a fundamental human right, and we thank our partners for making this possible.",
      image: "https://images.unsplash.com/photo-1584515901367-f1c27b744aae?w=800&auto=format&fit=crop&q=60",
      category: "Healthcare",
      authorName: "Dr. David Alao",
      authorEmail: "david.a@hhfoundation.org",
      status: "PUBLISHED",
    },
  ];

  await prisma.blogPost.deleteMany({});
  for (const p of posts) {
    await prisma.blogPost.create({ data: p });
  }
  console.log("Seeded blog posts");

  // 5. Seed Testimonials
  const testimonials = [
    {
      name: "Chinyere Okeke",
      role: "Scholarship Beneficiary",
      quote: "Thanks to the HH Foundation scholarship, I am currently studying Computer Science at the university. My dream of becoming a software engineer is now a reality. My widowed mother didn't have to worry about tuition.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60",
    },
    {
      name: "Mark Harrison",
      role: "Global Partner Sponsor",
      quote: "Partnering with HH Foundation has been an absolute honor. Their transparency, regular updates, and direct community impact set them apart. We look forward to sponsoring more healthcare drives next year.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
    },
  ];

  await prisma.testimonial.deleteMany({});
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log("Seeded testimonials");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
