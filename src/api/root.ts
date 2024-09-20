import * as express from 'express';
import { version } from './../utils';

const router = express.Router();

const onVersion = (req: express.Request, res: express.Response): void => {
  const versionCode = 65;
  const required = true;

  res.json({ version, versionCode, required });
};

router.get('/version', onVersion);
router.get('/versions', onVersion);

export default router;
