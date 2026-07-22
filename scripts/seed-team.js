const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const teamMembers = [
  {
    name: "AMB. CHINAZAEKPERE FAVOUR UMELO",
    role: "Founder/ Executive Officer",
    bio: "Championing humanitarian responses since 2012. Dedicated to quality education, healthcare outreaches, and youth empowerment across Nigeria.",
    image: "/team1.jpeg",
    facebook: "https://www.facebook.com/share/1SZmFhWGte/",
    email: "princessnazihez@yahoo.com",
    whatsapp: "+2349066008854",
    phone: "+2349066008854",
    order: 1,
  },
  {
    name: "AMB. Christian Ikoroha",
    role: "Secretary HHF",
    bio: "Over 10 years of experience in NGO operations and field coordination. Specializes in educational sponsorships and rural relief.",
    image: "/team2.jpeg",
    facebook: "https://www.facebook.com/search/top/?q=Chris%20Ikoroha",
    email: "chrisblessing2013@gmail.com",
    whatsapp: "+2348065628864",
    phone: "+2348065628864",
    order: 2,
  },
  {
    name: "Festus Chukwudiebere Egbo",
    role: "Director of Operations",
    bio: "Dedicated medical practitioner leading our rural healthcare teams to deliver free medical consults, prescription drugs, and basic surgeries.",
    image: "/team3.jpeg",
    facebook: "https://www.facebook.com/share/1C4pvbm6SB/?mibextid=wwXIfr",
    email: "festusegbo082@gmail.com",
    whatsapp: "+2347051307246",
    phone: "+2347051307246",
    order: 3,
  },
  {
    name: "SERAH ONUOHA, ESQ.",
    role: "Legal Advisor",
    bio: "Manages volunteer coordination, distribution networks, and event logistics to ensure transparent, fast aid delivery in the field.",
    image: "/team4.jpeg",
    facebook: "https://www.facebook.com/serah.onuoha?mibextid=ZbWKwL",
    email: "serahonuoha14@gmail.com",
    whatsapp: "+2348034473836",
    phone: "+2348034473836",
    order: 4,
  },
];

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
  {
    name: "Alhaji Musa Ibrahim",
    role: "Community Leader, Kano Outreach",
    quote: "The medical outreach was a lifesaver for our village. Over three hundred elders and children received free eye examinations, prescription glasses, and malaria treatments. We pray for their continued strength.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=60",
  },
  {
    name: "Sister Florence Nduka",
    role: "Human Empowerment Graduate",
    quote: "As a widow, raising four children alone was a daily battle. Through the skills bootcamp and start-up grant, I opened my own tailoring shop. Today, I feed my family and pay their school fees myself.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=60",
  },
  {
    name: "Dr. Amara Williams",
    role: "Volunteer Medical Officer",
    quote: "Serving on the frontline with HH Foundation in remote riverine areas has shown me the power of collective action. We treated conditions that would have gone ignored for years due to poverty.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=60",
  },
  {
    name: "Tunde Folawiyo",
    role: "Disaster Relief Coordinator",
    quote: "When the floods hit our community, HH Foundation was the first on the ground with food packs, clean drinking water, and blankets. Their rapid response saved countless lives from hunger and disease.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60",
  },
];

async function main() {
  console.log("Seeding team members...");
  await prisma.teamMember.deleteMany({});
  for (const tm of teamMembers) {
    await prisma.teamMember.create({ data: tm });
  }

  console.log("Seeding testimonials...");
  await prisma.testimonial.deleteMany({});
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log("Successfully seeded team members and testimonials!");
}

main()
  .catch((e) => {
    console.error("Error seeding team/testimonials:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
