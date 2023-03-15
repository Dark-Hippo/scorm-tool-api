import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload, { FileArray } from 'express-fileupload';

dotenv.config();

const server: Express = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(fileUpload());

server.get('/health', (req: Request, res: Response) => {
  res.send({ date: new Date() });
});

server.post('/scorm/validate', async (req: Request, res: Response) => {
  try {
    if (!req.files) {
      res.status(400).send({ message: 'No file sent' });
    }

    const files = req.files;
    console.log(files);

    // Unzip to system temp dir
    // Check for 'scormcontent' directory
    // Check for index.html file inside directory

    res.status(200).send({ isValid: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
