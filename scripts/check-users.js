const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching users from database...");
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      name: true
    }
  });
  console.log("-----------------------------------------");
  console.log("Registered Users in Database:");
  console.log("-----------------------------------------");
  if (users.length === 0) {
    console.log("No users found in database!");
  } else {
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
    });
  }
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
