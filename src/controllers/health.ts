// import express and related types
import express, { Request, Response, Router } from 'express';

// create a new express router instance
const router: Router = express.Router();

// express get request for simple health check endpoint
router.get('/', async (req: Request, res: Response) => {
  return res
    .status(200)
    .send({ message: 'Health check passed', isValid: true });
});
