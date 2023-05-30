import express, { Request, Response, Router } from 'express';
import { Prisma } from '@prisma/client';
import { logError } from '../utils/logger';
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getAllCoursesWithSites,
  getCourse,
  getCourseWithSite,
  updateCourse,
} from '../adapters/course';
import { deleteSiteFiles } from '../utils/site';

const router: Router = express.Router();

router.get('/:id(\\d+)?', async (req: Request, res: Response) => {
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
});

router.get('/site', async (req: Request, res: Response) => {
  try {
    const coursesWithSites = await getAllCoursesWithSites();
    return res.status(200).send(coursesWithSites);
  } catch (error) {
    logError(error);
    return res.status(500).send(error);
  }
});

router.get('/:id(\\d+)/site', async (req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);
    const courseWithSite = await getCourseWithSite(id);
    if (!courseWithSite) {
      return res
        .status(404)
        .send({ message: 'Course not found', isValid: false });
    }

    return res.status(200).send(courseWithSite);
  } catch (error) {
    logError(error);
    return res.status(500).send(error);
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const course: Prisma.CourseCreateInput = req.body;
    const newCourse = await createCourse(course);

    return res.status(201).send(newCourse);
  } catch (error) {
    logError(error);
    return res.status(500).send(error);
  }
});

router.patch('/:id?', async (req: Request, res: Response) => {
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
});

router.delete('/:id(\\d+)', async (req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);

    const course = await getCourseWithSite(id);

    if (!course) {
      return res
        .status(404)
        .send({ message: `CourseId ${id} not found`, isValid: false });
    }

    await deleteCourse(course.id);

    if (course.site) {
      deleteSiteFiles(course.site.guid);
    }

    return res.status(204).send();
  } catch (error) {
    logError(error);
    return res.status(500).send(error);
  }
});

export default router;
