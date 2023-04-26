import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload, { UploadedFile } from 'express-fileupload';
import JSZip, { JSZipObject } from 'jszip';
import { v4 as uuid4 } from 'uuid';
import path from 'path';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { hasManifestFile } from './src/validation/hasManifestFile';
import { isZipFile } from './src/validation/isZipFile';
import { log } from './src/utils/logger';
import { saveScormToContent } from './src/utils/saveScorm';

dotenv.config();

const server: Express = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(fileUpload());

server.get('/health', (req: Request, res: Response) => {
  return res.send({ date: new Date() });
});

server.post('/scorm/validate', async (req: Request, res: Response) => {
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

server.post('/scorm/upload', async (req: Request, res: Response) => {
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
    log('About to save scorm files');
    await saveScormToContent(file);

    return res.status(200).send({ success: true });
  } catch (error) {
    return res.status(500).send(error);
  }
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
