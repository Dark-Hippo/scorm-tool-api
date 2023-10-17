import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import scorm from './src/controllers/scorm';
import user from './src/controllers/user';
import course from './src/controllers/course';
import health from './src/controllers/health';
import bodyParser from 'body-parser';
import site from './src/controllers/site';
import { errorHandler } from './src/middleware/error';
import { notFoundHandler } from './src/middleware/notFound';

dotenv.config();

const server: Express = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(fileUpload());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use(
  '/content',
  (req: Request, res: Response, next: any) => {
    console.log(req.path);
    console.log(req.headers);
    // authenticate auth0 cookie

    next();
  },
  express.static('./content')
);

server.use('/scorm', scorm);
server.use('/users', user);
server.use('/course', course);
server.use('/site', site);
// add health endpoints to server
server.use('/health', health);

server.use(errorHandler);

server.use(notFoundHandler);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
