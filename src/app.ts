import type { CorsOptions, CorsOptionsDelegate } from 'cors';
import cors from 'cors';
import ejs from 'ejs';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import path from 'path';

import RouteAddon from './api/addon';
import RouteApi from './api/root';

const apiLimiter = rateLimit({
  windowMs: 5000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
});

export const createExpressApp = (): express.Application => {
  const app = express();
  const filePath = path.join(path.resolve(), './files');

  app.use(express.static(filePath));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const allowlist = ['*'];

  if (process.env.NODE_ENV !== 'production') {
    allowlist.push('http://localhost:19000');
  }

  const corsOptionsDelegate: CorsOptionsDelegate<any> = (
    req,
    callback,
  ): void => {
    let corsOptions: CorsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true };
    } else {
      corsOptions = { origin: false };
    }

    callback(null, corsOptions);
  };

  app.use(cors(corsOptionsDelegate));

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 100000000, maxFiles: 10 }), // 100mb
  );

  app.set('views', path.join(path.resolve(), './html'));
  app.engine('html', ejs.renderFile);
  app.set('view engine', 'html');
  app.use('/addon', apiLimiter, RouteAddon);
  app.use('', RouteApi);

  return app;
};
