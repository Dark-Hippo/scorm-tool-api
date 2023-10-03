import { PrismaClient, User } from '@prisma/client';
import { logError } from '../utils/logger';
import {
  createUser as createAuth0User,
  updateUser as updateAuth0User,
  blockUser as blockAuth0User,
  getUser as getAuth0User,
} from '../utils/auth0';

const prisma: PrismaClient = new PrismaClient();

export const getUser = async (id: number): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) return null;

    if (user.auth0Id) {
      await getAuth0User(user.auth0Id);
    }

    return user;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
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
    const createdUser = await prisma.user.create({
      data: user,
    });

    const auth0Id = await createAuth0User(createdUser);

    createdUser.auth0Id = auth0Id;

    await prisma.user.update({
      where: { id: createdUser.id },
      data: { auth0Id: auth0Id },
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
  userId: number
): Promise<User> => {
  try {
    if (!updatedDetails.updatedDate) {
      updatedDetails.updatedDate = new Date();
    }

    const updatedUser: User = await prisma.user.update({
      where: { id: userId },
      data: updatedDetails,
    });

    updateAuth0User(updatedUser);

    return updatedUser;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const deactivateUser = async (userId: number): Promise<User> => {
  try {
    const deactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: { active: false },
    });

    await blockAuth0User(deactivatedUser);

    return deactivatedUser;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * "Soft deletes" a user by setting the deleted flag to true and active flag to false.
 * @param userId id of the user to soft delete
 */
export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deleted: true, active: false },
    });
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
