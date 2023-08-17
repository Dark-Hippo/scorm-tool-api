// import prisma client and logError function
import { PrismaClient } from '@prisma/client';
import { logError } from '../utils/logger';

// new prisma client instance
const prisma: PrismaClient = new PrismaClient();

// check connection function to check database connection
export const checkConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    logError(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

// export the prisma client instance
export default prisma;
