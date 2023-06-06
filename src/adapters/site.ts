import { Site, PrismaClient, Prisma } from '@prisma/client';
import { logError } from '../utils/logger';
import type { SiteWithCourse } from '../types/courseAndSite';

const prisma: PrismaClient = new PrismaClient();

export const getSite = async (id: number): Promise<SiteWithCourse | null> => {
  try {
    const site = await prisma.site.findUnique({
      where: { id: id },
      include: { course: true },
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

export const createSite = async (
  site: Prisma.SiteCreateInput
): Promise<Site> => {
  try {
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
  updatedDetails: Prisma.SiteUpdateInput,
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

export const deleteSite = async (siteId: number): Promise<Site> => {
  try {
    const deletedSite: Site = await prisma.site.delete({
      where: { id: siteId },
      include: { course: true },
    });

    return deletedSite;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
