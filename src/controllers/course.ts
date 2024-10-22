import express, { Request, Response, Router } from 'express';
import { Prisma } from '@prisma/client';
import { logError } from '../utils/logger';
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourse,
  updateCourse,
} from '../adapters/course';
import { deleteSiteFiles } from '../utils/site';
import { validateAccessToken } from '../middleware/auth0';

const router: Router = express.Router();

router.get(
  '/:id(\\d+)?',
  validateAccessToken,
  async (req: Request, res: Response) => {
    try {
      if (req.params.id) {
        const id: number = Number(req.params.id);
        const course = await getCourse(id);
        if (!course) {
          return res
            .status(404)
            .send({ message: 'Course not found', isValid: false });
        }

        return res.status(200).send(course);
      } else {
        const courses = await getAllCourses();
        return res.status(200).send(courses);
      }
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

router.post('/', validateAccessToken, async (req: Request, res: Response) => {
  try {
    const course: Prisma.CourseCreateInput = req.body;
    const newCourse = await createCourse(course);

    return res.status(201).send(newCourse);
  } catch (error) {
    logError(error);
    return res.status(500).send(error);
  }
});

router.patch(
  '/:id?',
  validateAccessToken,
  async (req: Request, res: Response) => {
    try {
      if (!req.params?.id) {
        return res
          .status(400)
          .send({ message: 'An id is required to update', isValid: false });
      }

      if (!Number.isInteger(Number(req.params.id))) {
        return res.status(400).send({
          message: `Course Id must be a number, not '${req.params.id}'`,
          isValid: false,
        });
      }

      const id: number = Number(req.params.id);
      const courseData: Prisma.CourseUpdateInput = req.body;

      const course = await getCourse(id);

      if (!course) {
        return res
          .status(404)
          .send({ message: `CourseId ${id} not found`, isValid: false });
      }

      const updatedCourse = await updateCourse(courseData, course.id);

      return res.status(200).send(updatedCourse);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

router.delete(
  '/:id(\\d+)',
  validateAccessToken,
  async (req: Request, res: Response) => {
    try {
      const id: number = Number(req.params.id);

      const course = await getCourse(id);

      if (!course) {
        return res
          .status(404)
          .send({ message: `CourseId ${id} not found`, isValid: false });
      }

      await deleteCourse(course.id);

      deleteSiteFiles(course.guid);

      return res.status(204).send();
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

export default router;
