import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload, { UploadedFile } from 'express-fileupload';
import JSZip, { JSZipObject } from 'jszip';
import { v4 as uuid4 } from 'uuid';
import path from 'path';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';

dotenv.config();

const server: Express = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(fileUpload());

const log = (text:string) => {
  console.log(text);
}

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
    const newSiteDirectory = path.join('./content', newSiteId);

    await mkdir(newSiteDirectory);

    const filesToSave = [];
    const writeFile = (file: JSZipObject, directory: string) => {
      const newFileWithPath = path.join(directory, file.name);
      
      return new Promise(async resolve => {
        await mkdir(path.dirname(newFileWithPath), {recursive: true})
        const out = createWriteStream(newFileWithPath);
        file.nodeStream().pipe(out);
        out.on('finish', () => {
          log(`File ${newFileWithPath} created.`);
          resolve(newFileWithPath);
        });
      });
    }
    for (const key in contents.files) {
        const file = contents.files[key];
        const filename = file.name;
        
        if(!path.extname(filename)) {
          continue;
        }
        filesToSave.push(writeFile(file, newSiteDirectory));
    }

    const savedFiles = await Promise.all(filesToSave);
    console.log(savedFiles);
    
    return res.status(200).send({ success: true });
  } catch (error) {
    return res.status(500).send(error);
  }
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
