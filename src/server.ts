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

const armor = new ApolloArmor({
  costLimit: {
    enabled: true,
    maxCost: 5000,
    objectCost: 2,
    scalarCost: 1,
    depthCostFactor: 1.5,
    ignoreIntrospection: process.env.NODE_ENV !== 'production',
    fragmentRecursionCost: 5,
  },
  maxDepth: {
    enabled: true,
    n: 6,
  },
  maxAliases: {
    enabled: true,
    n: 2,
  },
  maxDirectives: {
    enabled: true,
    n: 6,
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
config();

const PORT = process.env.PORT || 8000;
const expressApp = createExpressApp();
const createApolloServer = (httpServer: Server): ApolloServer<Context> => {
  return new ApolloServer<Context>({
    schema: schema,
    csrfPrevention: true,
    persistedQueries: {
      ttl: 900,
    },
    ...protection,
    plugins: [
      ...protection.plugins,
      ApolloServerPluginDrainHttpServer({ httpServer }),
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
    ],
    validationRules: [...protection.validationRules],
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
      origin: ['http://localhost:3000', 'https://sls.puthi.online'],
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
