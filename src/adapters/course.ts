import { Course, PrismaClient, Prisma } from '@prisma/client';
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

export const createCourse = async (
  course: Prisma.CourseCreateInput
): Promise<Course> => {
  try {
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
  updatedDetails: Prisma.CourseUpdateInput,
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

export const deleteCourse = async (courseId: number): Promise<Course> => {
  try {
    const deletedCourse: Course = await prisma.course.delete({
      where: { id: courseId },
    });

    return deletedCourse;
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
