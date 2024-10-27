import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer as createHttpServer } from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { config } from 'dotenv';
import { schema } from './modules/schema';
import { Context, createContext } from './context';
import type { Server } from 'http';
import { createExpressApp } from './app';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloArmor } from '@escape.tech/graphql-armor';
import { errorHandler } from './utils';
import { createStellateLoggerPlugin } from 'stellate/apollo-server';
config();

const stellatePlugin = createStellateLoggerPlugin({
  serviceName: 'puthi',
  token:
    'stl8log_4f0a62344f89d7869ccd2969b478522f9a6117edb4228ca200207efc7d5fb2fb',
  fetch: fetch,
});

const armor = new ApolloArmor({
  costLimit: {
    enabled: true,
    maxCost: 100,
    objectCost: 2,
    scalarCost: 1,
    depthCostFactor: 1.5,
    ignoreIntrospection: process.env.NODE_ENV !== 'production',
    fragmentRecursionCost: 5,
  },
  maxDepth: {
    enabled: true,
    n: 10,
  },
  maxAliases: {
    enabled: true,
    n: 2,
    propagateOnRejection: true,
  },
  maxDirectives: {
    enabled: true,
    n: 1,
  },
  maxTokens: {
    enabled: true,
    n: 500,
  },
  blockFieldSuggestion: {
    enabled: true,
    mask: 'Got wrong field',
  },
});
const protection = armor.protect();

const PORT = process.env.PORT || 8000;
const expressApp = createExpressApp();
const createApolloServer = (httpServer: Server): ApolloServer<Context> => {
  return new ApolloServer<Context>({
    schema: schema,
    csrfPrevention: process.env.NODE_ENV === 'production',
    introspection: process.env.NODE_ENV !== 'production',
    persistedQueries: {
      ttl: 900,
    },
    ...protection,
    plugins: [
      stellatePlugin,
      ...protection.plugins,
      ApolloServerPluginDrainHttpServer({ httpServer }),
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
    ],
    validationRules: [...protection.validationRules],
    formatError:
      process.env.NODE_ENV === 'production' ? errorHandler : undefined,
  });
};

const configureMiddleware = ({
  apolloServer,
  app,
  port,
}: {
  apolloServer: ApolloServer<Context>;
  httpServer: Server;
  app: express.Application;
  port: number;
}): (() => void) => {
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['http://localhost:3000', 'https://sls.pi314.pro'],
      methods: ['POST'],
      exposedHeaders: 'Authorization, X-Secret',
    }),
    bodyParser.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => createContext({ req, res }),
    }),
  );

  return (): void => {
    process.stdout.write(
      `🚀 Server ready at http://localhost:${port}/graphql\n`,
    );
  };
};

export const startServer = async ({
  port,
}: {
  port: number | string;
}): Promise<Server> => {
  const httpServer = createHttpServer(expressApp);
  const apolloServer = createApolloServer(httpServer);
  await apolloServer.start();

  const handleApolloServerInit = configureMiddleware({
    apolloServer,
    app: expressApp,
    httpServer,
    port: Number(port),
  });

  return httpServer.listen({ port }, () => {
    handleApolloServerInit();
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer({ port: PORT });

  // Note: below is sample of cron job.
  // const rule = new schedule.RecurrenceRule();

  // rule.tz = 'Asia/Phnom_Penh';
  // rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  // rule.hour = 4;
  // rule.minute = 0;

  // schedule.scheduleJob(rule, () => {
  // });
}
