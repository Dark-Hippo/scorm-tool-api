import { Site, PrismaClient } from '@prisma/client';
import { logError } from '../utils/logger';

const prisma: PrismaClient = new PrismaClient();

export const getSite = async (id: number): Promise<Site | null> => {
  try {
    const site = await prisma.site.findUnique({
      where: { id: id },
    });

    return site;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getAllSites = async (): Promise<Site[] | null> => {
  try {
    const allSites = await prisma.site.findMany();

    return allSites;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const createSite = async (site: Site): Promise<Site> => {
  try {
    const date = new Date();
    if (!site.createdDate) site.createdDate = date;
    if (!site.updatedDate) site.updatedDate = date;

    const createdSite = await prisma.site.create({
      data: site,
    });

    return createdSite;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const updateSite = async (
  updatedDetails: Site,
  siteId: number
): Promise<Site> => {
  try {
    if (!updatedDetails.updatedDate) {
      updatedDetails.updatedDate = new Date();
    }

    const updatedSite: Site = await prisma.site.update({
      where: { id: siteId },
      data: updatedDetails,
    });

    return updatedSite;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
