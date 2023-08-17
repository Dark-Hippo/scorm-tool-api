// import express and related types
import express, { Request, Response, Router } from 'express';
import { checkConnection } from '../adapters/db';
// import logError function
import { logError } from '../utils/logger';

// create a new express router instance
const router: Router = express.Router();

// express get request for simple health check endpoint
router.get('/', async (req: Request, res: Response) => {
  return res
    .status(200)
    .send({ message: 'Health check passed', isValid: true });
});

// express get request for simple health check endpoint that makes a call to the database
router.get('/db', async (req: Request, res: Response) => {
  try {
    // call the checkConnection function
    const isConnected: boolean = await checkConnection();

    // if the connection is successful, return a 200 response
    if (isConnected) {
      return res

        .status(200)
        .send({ message: 'Database connection successful', isValid: true });
    }

    // if the connection is unsuccessful, return a 500 response
    return res
      .status(500)
      .send({ message: 'Database connection failed', isValid: false });
  } catch (error) {
    // if there is an error, log the error and return a 500 response
    logError(error);
    return res.status(500).send({ message: error, isValid: false });
  }
});

// export the router
export default router;
