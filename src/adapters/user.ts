import { PrismaClient, User } from '@prisma/client';
import { logError } from '../utils/logger';

const prisma: PrismaClient = new PrismaClient();

export const getUser = async (id: number): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    return user;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const allUsers = await prisma.user.findMany();

    return allUsers;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const createUser = async (user: User): Promise<User> => {
  try {
    const date = new Date();
    if (!user.createdDate) user.createdDate = date;
    if (!user.updatedDate) user.updatedDate = date;

    const createdUser = await prisma.user.create({
      data: user,
    });

    return createdUser;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const updateUser = async (
  updatedDetails: User,
  user: User
): Promise<User> => {
  try {
    if (!updatedDetails.updatedDate) {
      updatedDetails.updatedDate = new Date();
    }

    const updatedUser: User = await prisma.user.update({
      where: { id: user.id },
      data: updatedDetails,
    });

    return updatedUser;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};