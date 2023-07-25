import express, { Request, Response, Router } from 'express';
import { Prisma } from '@prisma/client';
import { logError } from '../utils/logger';
import {
  createSite,
  deleteSite,
  getAllSites,
  getSite,
  updateSite,
} from '../adapters/site';
import { existsSync } from 'fs';
import path from 'path';
import { SiteWithCourse } from '../types/courseAndSite';
import { deleteSiteFiles } from '../utils/site';
import { validateAccessToken } from '../middleware/auth0';

const router: Router = express.Router();
const contentDirectory = './content';

router.get(
  '/:id(\\d+)?',
  validateAccessToken,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      if (req.params.id) {
        const id: number = Number(req.params.id);
        const site = await getSite(id);
        if (!site) {
          return res
            .status(404)
            .send({ message: 'Site not found', isValid: false });
        }

        return res.status(200).send(site);
      } else {
        const sites = await getAllSites();
        return res.status(200).send(sites);
      }
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

router.post(
  '/',
  validateAccessToken,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const site: Prisma.SiteCreateInput = req.body;
      const newSite = await createSite(site);

      return res.status(201).send(newSite);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

router.patch(
  '/:id?',
  validateAccessToken,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params?.id) {
        return res
          .status(400)
          .send({ message: 'An id is required to update', isValid: false });
      }

      if (!Number.isInteger(Number(req.params.id))) {
        return res.status(400).send({
          message: `Site Id must be a number, not '${req.params.id}'`,
          isValid: false,
        });
      }

      const id: number = Number(req.params.id);
      const siteData: Prisma.SiteUpdateInput = req.body;

      const site = await getSite(id);

      if (!site) {
        return res
          .status(404)
          .send({ message: `SiteId ${id} not found`, isValid: false });
      }

      const updatedSite = await updateSite(siteData, site.id);

      return res.status(200).send(updatedSite);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

router.delete(
  '/:id(\\d+)',
  validateAccessToken,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const id: number = Number(req.params.id);

      const site = await getSite(id);

      if (!site) {
        return res
          .status(404)
          .send({ message: `SiteId ${id} not found`, isValid: false });
      }

      await deleteSite(site.id);

      deleteSiteFiles(site.guid);

      return res.status(204).send();
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

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

router.get(
  '/:id(\\d+)/:guid/webcontent/*',
  validateAccessToken,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id, guid } = req.params;
      const siteId: number = Number(id);

      const site: SiteWithCourse | null = await getSite(siteId);

      if (!site) {
        return res
          .status(404)
          .send({ message: 'Site not found', isValid: false });
      }

      if (!site.course) {
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
      const siteId: number = Number(id);

      const site: SiteWithCourse | null = await getSite(siteId);

      if (!site) {
        return res
          .status(404)
          .send({ message: 'Site not found', isValid: false });
      }

      if (!site.course) {
        return res
          .status(404)
          .send({ message: 'Course not found', isValid: false });
      }

      const entryPoint: string = site.course.courseEntrypoint;

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
