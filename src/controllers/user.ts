import express, { Request, Response, Router } from 'express';
import { User } from '@prisma/client';
import { logError } from '../utils/logger';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../adapters/user';
import { validateAccessToken } from '../middleware/auth0';

const router: Router = express.Router();

router.get(
  '/:id?',
  validateAccessToken,
  async (req: Request, res: Response) => {
    try {
      if (req.params?.id && !Number.isInteger(Number(req.params.id))) {
        return res
          .status(400)
          .send({ message: 'Id must be a number', isValid: false });
      }

      if (req.params.id) {
        const id: number = Number(req.params.id);
        const user = await getUser(id);
        if (!user) {
          return res
            .status(404)
            .send({ message: 'User not found', isValid: false });
        }

        return res.status(200).send(user);
      } else {
        const users = await getAllUsers();
        return res.status(200).send(users);
      }
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

router.post('/', validateAccessToken, async (req: Request, res: Response) => {
  try {
    const user: User = req.body as User;
    const newUser = await createUser(user);

    return res.status(201).send(newUser);
  } catch (error) {
    logError(error);
    return res.status(500).send(error);
  }
});

router.put(
  '/:id?',
  validateAccessToken,
  async (req: Request, res: Response) => {
    try {
      if (!req.params?.id) {
        return res
          .status(400)
          .send({ message: 'An id is required to update', isValid: false });
      }

      if (!Number.isInteger(Number(req.params.id))) {
        return res.status(400).send({
          message: `User Id must be a number, not '${req.params.id}'`,
          isValid: false,
        });
      }

      const id: number = Number(req.params.id);
      const userData: User = req.body;

      const user = await getUser(id);

      if (!user) {
        return res
          .status(404)
          .send({ message: `UserId ${id} not found`, isValid: false });
      }

      const updatedUser = await updateUser(userData, user.id);

      return res.status(200).send(updatedUser);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  }
);

router.delete(
  '/:id?',
  validateAccessToken,
  async (req: Request, res: Response) => {
    try {
      if (!req.params?.id) {
        return res
          .status(400)
          .send({ message: 'An id is required to delete', isValid: false });
      }

      if (!Number.isInteger(Number(req.params.id))) {
        return res.status(400).send({
          message: `User Id must be a number, not '${req.params.id}'`,
          isValid: false,
        });
      }

      const id: number = Number(req.params.id);

      const user = await getUser(id);

      if (!user) {
        return res
          .status(404)
          .send({ message: `UserId ${id} not found`, isValid: false });
      }

      await deleteUser(id);

      return res
        .status(200)
        .send({ message: `UserId ${id} deleted`, isValid: true });
    } catch (error) {
      logError(error);
    }
  }
);

export default router;
