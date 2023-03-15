import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const server: Express = express();
const port = process.env.PORT || 3001;

server.use(cors());

server.get('/health', (req: Request, res: Response) => {
  res.send({ date: new Date() });
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
