import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import scorm from './src/controllers/scorm';
import user from './src/controllers/user';

dotenv.config();

const server: Express = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(fileUpload());

server.get('/health', (req: Request, res: Response) => {
  return res.send({ date: new Date() });
});

server.use('/scorm', scorm);
server.use('/user', user);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
