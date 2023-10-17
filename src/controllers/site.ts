import express, { Request, Response, Router } from 'express';
import { logError } from '../utils/logger';
import { existsSync } from 'fs';
import path from 'path';

import { validateAccessToken } from '../middleware/auth0';
import { getCourse } from '../adapters/course';

const router: Router = express.Router();
const contentDirectory = './content';

router.get(
  '/:id(\\d+)/:guid/original',
  validateAccessToken,
  (req: Request, res: Response): Response | void => {
    try {
      const siteDirectory = path.join(contentDirectory, req.params.guid);
      const filename = 'original.zip';
      const filepath = path.join(siteDirectory, filename);

      if (existsSync(filepath)) {
        return res.download(filepath, filename);
      }

      return res.status(404).send({
        message: `No original SCORM file saved for '${req.params.guid}'`,
        isValid: false,
      });
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

router.use(
  '/:guid/course/scormcontent/*',
  (req: Request, res: Response, next: any) => {
    const { guid } = req.params;
    console.log(`${guid}`);
    console.log(req.params);
    next();
  },
  express.static(
    'content/4e4bf1c5-dfc2-4721-821c-0affc592213b/course/scormcontent/',
    {
      index: ['test.html'],
    }
  )
);

router.get(
  '/:id(\\d+)/:guid/webcontent2/*',
  validateAccessToken,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id, guid } = req.params;
      const courseId: number = Number(id);

      const course = await getCourse(courseId);

      if (!course) {
        return res
          .status(404)
          .send({ message: 'Course not found', isValid: false });
      }

      const filepath: string = req.params[0] ? req.params[0] : 'index.html';

      let courseDirectory: string = path.join(
        contentDirectory,
        guid,
        'course/scormcontent'
      );

      if (existsSync(courseDirectory)) {
        return res.sendFile(filepath, { root: courseDirectory });
      }

      return res.status(404).send({
        message: `No site available for '${req.params.guid}'`,
        isValid: false,
      });
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

// TODO: caching so it doesn't make a call to the database to get the
// site / course details for every file
router.get(
  '/:id(\\d+)/:guid/course/*',
  validateAccessToken,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id, guid } = req.params;
      const courseId: number = Number(id);

      const course = await getCourse(courseId);

      if (!course) {
        return res
          .status(404)
          .send({ message: 'Course not found', isValid: false });
      }

      const entryPoint: string = course.courseEntrypoint;

      const filepath: string = req.params[0] ? req.params[0] : entryPoint;
      console.log('filepath', filepath);
      let fileDirectory: string = '';
      let filename: string = '';

      if (filepath.includes('/')) {
        fileDirectory = filepath.substring(0, filepath.lastIndexOf('/'));
        filename = filepath.substring(filepath.lastIndexOf('/') + 1);
      } else {
        fileDirectory = entryPoint.substring(0, entryPoint.lastIndexOf('/'));
        filename = filepath;
      }

      if (!filename) {
        filename = 'index.html';
      }

      let courseDirectory: string = path.join(
        contentDirectory,
        guid,
        'course',
        fileDirectory
      );

      if (existsSync(courseDirectory)) {
        return res.sendFile(filename, { root: courseDirectory });
      }

      return res.status(404).send({
        message: `No site available for '${req.params.guid}'`,
        isValid: false,
      });
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

export default router;
