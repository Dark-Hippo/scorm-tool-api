import { Course, PrismaClient } from '@prisma/client';
import { logError } from '../utils/logger';

const prisma: PrismaClient = new PrismaClient();

export const getCourse = async (id: number): Promise<Course | null> => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: id },
    });

    return course;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getAllCourses = async (): Promise<Course[] | null> => {
  try {
    const allCourses = await prisma.course.findMany();

    return allCourses;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const createCourse = async (course: Course): Promise<Course> => {
  try {
    const date = new Date();
    if (!course.createdDate) course.createdDate = date;
    if (!course.updatedDate) course.updatedDate = date;

    const createdCourse = await prisma.course.create({
      data: course,
    });

    return createdCourse;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const updateCourse = async (
  updatedDetails: Course,
  courseId: number
): Promise<Course> => {
  try {
    if (!updatedDetails.updatedDate) {
      updatedDetails.updatedDate = new Date();
    }

    const updatedCourse: Course = await prisma.course.update({
      where: { id: courseId },
      data: updatedDetails,
    });

    return updatedCourse;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
