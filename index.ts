import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import scorm from './src/controllers/scorm';
import user from './src/controllers/user';
import course from './src/controllers/course';
import health from './src/controllers/health';
import bodyParser from 'body-parser';
import { errorHandler } from './src/middleware/error';
import { notFoundHandler } from './src/middleware/notFound';

dotenv.config();

const server: Express = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(fileUpload());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use('/scorm', scorm);
server.use('/users', user);
server.use('/course', course);
// add health endpoints to server
server.use('/health', health);

server.use(errorHandler);

server.use(notFoundHandler);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
