import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { log } from 'console';

const router: Router = express.Router();
const prisma: PrismaClient = new PrismaClient();

router.get('/list', async (req: Request, res: Response) => {
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

export default router;
