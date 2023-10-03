import express, { Request, Response, Router } from 'express';
import { UploadedFile } from 'express-fileupload';
import { hasManifestFile } from '../validation/hasManifestFile';
import { isZipFile } from '../validation/isZipFile';
import { getScormDetails, saveScormToContent } from '../utils/scorm';
import { Prisma } from '@prisma/client';
import { createCourse } from '../adapters/course';

const router: Router = express.Router();

router.post('/validate', async (req: Request, res: Response) => {
  try {
    if (!req?.files) {
      return res
        .status(400)
        .send({ message: 'No file(s) sent', isValid: false });
    }

    if (!req?.files?.scorm) {
      return res
        .status(400)
        .send({ message: "Key 'scorm' required", isValid: false });
    }

    if (Array.isArray(req.files?.scorm)) {
      return res
        .status(400)
        .send({ message: 'One file at a time, please', isValid: false });
    }

    const file = req.files?.scorm as UploadedFile;

    if (!isZipFile(file)) {
      return res.status(400).send({
        message: `File must be of type 'application/zip', ${file.mimetype} is not valid`,
        isValid: false,
      });
    }

    if (!hasManifestFile(file)) {
      return res.status(400).send({
        message: 'Supplied file is not a valid SCORM file',
        isValid: false,
      });
    }

    const { title, language } = getScormDetails(file);

    return res
      .status(200)
      .send({ isValid: true, title: title, language: language });
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * formData:
 *  scorm: <scorm file>
 *  userId: <Id of creating user>
 */
router.post('/upload', async (req: Request, res: Response) => {
  try {
    if (!req?.files) {
      return res
        .status(400)
        .send({ message: 'No file(s) sent', isValid: false });
    }

    if (!req?.files?.scorm) {
      return res
        .status(400)
        .send({ message: "Key 'scorm' required", isValid: false });
    }

    if (Array.isArray(req.files?.scorm)) {
      return res
        .status(400)
        .send({ message: 'One file at a time, please', isValid: false });
    }

    const file = req.files?.scorm as UploadedFile;

    if (!isZipFile(file)) {
      return res.status(400).send({
        message: `File must be of type 'application/zip', ${file.mimetype} is not valid`,
        isValid: false,
      });
    }

    if (!hasManifestFile(file)) {
      return res.status(400).send({
        message: 'Supplied file is not a valid SCORM file',
        isValid: false,
      });
    }

    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).send({
        message: 'No userId supplied with request',
        isValid: false,
      });
    }

    if (!Number.isInteger(Number(userId))) {
      return res.status(400).send({
        message: `UserId must be a number, not '${userId}'`,
        isValid: false,
      });
    }

    const { title, language, courseEntrypoint } = getScormDetails(file);
    const siteId = await saveScormToContent(file, true);

    const course: Prisma.CourseCreateInput = {
      title: title,
      language: language,
      guid: siteId,
      filename: file.name,
      createdBy: { connect: { id: Number(userId) } },

      courseEntrypoint: courseEntrypoint,
    };

    const createdCourse = await createCourse(course);
    let guid = createdCourse.guid;

    return res.status(201).location(`site/${guid}/course`).send({
      isValid: true,
      course: createdCourse,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
