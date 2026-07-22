const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log("Resetting admin users in database...");

  // Delete all users
  const deleteCount = await prisma.user.deleteMany({});
  console.log(`Deleted ${deleteCount.count} existing user(s).`);

  // Create new single admin user
  const hashedPassword = await bcrypt.hash("Chinedu2$", 10);
  const newAdmin = await prisma.user.create({
    data: {
      email: "admin@hephzibahhumanitarianf.org",
      name: "HH Foundation Admin",
      password: hashedPassword,
      role: "ADMIN"
    }
  });

  console.log("Successfully created new single admin:");
  console.log(`- Email: ${newAdmin.email}`);
  console.log(`- Role: ${newAdmin.role}`);
  console.log(`- Name: ${newAdmin.name}`);
}

main()
  .catch((e) => {
    console.error("Error resetting admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
