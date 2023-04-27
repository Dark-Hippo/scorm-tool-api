import express, { Request, Response, Router } from 'express';
import { PrismaClient, User } from '@prisma/client';
import { log } from 'console';

const router: Router = express.Router();
const prisma: PrismaClient = new PrismaClient();

router.get('/:id?', async (req: Request, res: Response) => {
  try {
    const main = async () => {
      const allUsers = await prisma.user.findMany();

      return allUsers;
    };

    const users = await main();

    return res.status(200).send(users);
  } catch (error) {
    log(error);
    return res.status(500).send(error);
  } finally {
    await prisma.$disconnect();
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const user: User = req.body as User;
    const date = new Date();
    if (!user.createdDate) user.createdDate = date;
    if (!user.updatedDate) user.updatedDate = date;

    const main = async (user: User) => {
      await prisma.user.create({
        data: user,
      });

      const allUsers = await prisma.user.findMany();
      return allUsers;
    };

    const users = await main(req.body);

    return res.status(200).send(users);
  } catch (error) {
    log(error);
    return res.status(500).send(error);
  } finally {
    await prisma.$disconnect();
  }
});

router.patch('/:id?', async (req: Request, res: Response) => {
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
    if (!userData.updatedDate) {
      userData.updatedDate = new Date();
    }

    const main = async (id: number, data: User) => {
      const user: User = await prisma.user.update({
        where: { id: id },
        data: data,
      });

      return user;
    };

    const user = await main(id, userData);

    return res.status(200).send(user);
  } catch (error) {
    log(error);
    return res.status(500).send(error);
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
