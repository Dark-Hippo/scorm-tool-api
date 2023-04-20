import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload, { UploadedFile } from 'express-fileupload';
import JSZip from 'jszip';
import { v4 as uuid4 } from 'uuid';
import path from 'path';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';

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

    if (
      !['application/zip', 'application/x-zip-compressed'].includes(
        file.mimetype
      )
    ) {
      return res.status(400).send({
        message: `File must be of type 'application/zip', ${file.mimetype} is not valid`,
        isValid: false,
      });
    }

    const contents = await JSZip.loadAsync(file.data);

    // check for imsmanifest file
    if (
      !Object.keys(contents.files).find((f) => f.endsWith('imsmanifest.xml'))
    ) {
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

    if (
      !['application/zip', 'application/x-zip-compressed'].includes(
        file.mimetype
      )
    ) {
      return res.status(400).send({
        message: `File must be of type 'application/zip', ${file.mimetype} is not valid`,
        isValid: false,
      });
    }

    const contents = await JSZip.loadAsync(file.data, {createFolders: true});

    // combine this with above for a single validate function
    if (
      !Object.keys(contents.files).find((f) => f.endsWith('imsmanifest.xml'))
    ) {
      return res.status(400).send({
        message: 'Supplied file is not a valid SCORM file',
        isValid: false,
      });
    }

    const newSiteId = uuid4();

    await mkdir(path.join('./content', newSiteId));

    for (const file in contents.files) {
      if (Object.prototype.hasOwnProperty.call(contents.files, file)) {
        const element = contents.files[file];
        const filename = element.name;
        if(!path.extname(filename)) {
          continue;
        }
        console.log(`Writing ${path.dirname(filename)}`);
        await mkdir(path.dirname(filename), {recursive: true})
        console.log(`Writing ${filename}`);
        element.nodeStream().pipe(createWriteStream(filename)).on('finish', () => {console.log(`Written file ${element.name}`)});
      }
    }

    return res.status(200).send({ isValid: true });
  } catch (error) {
    return res.status(500).send(error);
  }
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
