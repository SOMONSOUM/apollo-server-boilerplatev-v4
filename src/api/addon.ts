import type { Request, Response } from 'express';
import { Router } from 'express';
import { config } from 'dotenv';
config();

const onHome = async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') {
    res.send('It Works!');

    return;
  }

  res.redirect('https://google.com');
};

const router = Router();
router.get('/', onHome);

export default router;
