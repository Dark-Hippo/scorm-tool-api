import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error('ADMIN_EMAIL environment variable not set');
  }

  const adminName = process.env.ADMIN_NAME;
  if (!adminName) {
    throw new Error('ADMIN_NAME environment variable not set');
  }

  const user = await prisma.user.upsert({
    where: { email: email },
    create: {
      name: adminName,
      email: email,
      active: true,
      deleted: false,
      createdDate: new Date(),
      updatedDate: new Date(),
    },
    update: {},
  });

  console.log(`Created user with id: ${user.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
