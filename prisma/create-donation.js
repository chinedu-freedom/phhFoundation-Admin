const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Creating a donation...");

  // Find a campaign to link, if any exists
  const campaign = await prisma.campaign.findFirst();
  const campaignId = campaign ? campaign.id : null;

  if (campaign) {
    console.log(`Linking donation to campaign: "${campaign.title}" (${campaign.id})`);
  } else {
    console.log("No campaign found, creating general donation");
  }

  // Create a new donation
  const reference = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
  const donation = await prisma.donation.create({
    data: {
      amount: 150000, // ₦150,000
      donorName: "John Doe",
      donorEmail: "johndoe@example.com",
      isAnonymous: false,
      status: "PENDING",
      paymentMethod: "BANK_TRANSFER",
      reference: reference,
      campaignId: campaignId,
    },
  });

  console.log("Created donation successfully:", donation);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
