import express, { Request, Response, Router } from 'express';
import { Site, Prisma } from '@prisma/client';
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

const router: Router = express.Router();

router.get('/:id(\\d+)?', async (req: Request, res: Response) => {
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
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const site: Prisma.SiteCreateInput = req.body;
    const newSite = await createSite(site);

    return res.status(201).send(newSite);
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
});

router.delete('/:id?', async (req: Request, res: Response) => {
  try {
    if (!req.params?.id) {
      return res
        .status(400)
        .send({ message: 'An id is required to delete', isValid: false });
    }

    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).send({
        message: `Site Id must be a number, not '${req.params.id}'`,
        isValid: false,
      });
    }

    const id: number = Number(req.params.id);

    const site = await getSite(id);

    if (!site) {
      return res
        .status(404)
        .send({ message: `SiteId ${id} not found`, isValid: false });
    }

    await deleteSite(site.id);

    return res.status(204).send();
  } catch (error) {
    logError(error);
    return res.status(500).send(error);
  }
});

router.get('/:guid/original', async (req: Request, res: Response) => {
  try {
    const siteDirectory = path.join('./content', req.params.guid);
    const filename = 'original.zip';
    if (existsSync(path.join(siteDirectory, filename))) {
      res.sendFile(filename, { root: siteDirectory });
    }

    res
      .status(404)
      .send({
        message: `No original SCORM file saved for ${req.params.guid}`,
        isValid: false,
      });
  } catch (error) {
    logError(error);
    return res.status(500).send(error);
  }
});
export default router;
