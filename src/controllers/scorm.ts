import express, { Request, Response, Router } from 'express';
import { UploadedFile } from 'express-fileupload';
import { hasManifestFile } from '../validation/hasManifestFile';
import { isZipFile } from '../validation/isZipFile';
import { saveScormToContent } from '../utils/saveScorm';

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

    return res.status(200).send({ isValid: true });
  } catch (error) {
    return res.status(500).send(error);
  }
});

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

    const newSiteId = await saveScormToContent(file);

    return res
      .status(200)
      .send({ success: true, message: `New site created at ${newSiteId}` });
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
