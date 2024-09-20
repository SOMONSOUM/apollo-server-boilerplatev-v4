import { PrismaClient, User } from '@prisma/client';
import type express from 'express';
import { verifyToken } from './utils/encrypt';
import { GraphQLError } from 'graphql';

export interface Context {
  user: User | null;
  req: express.Request;
  prisma: PrismaClient;
}

const prisma = new PrismaClient();

type CreateContextParams = {
  req: express.Request;
  res: express.Response;
};

export async function createContext(
  params: CreateContextParams,
): Promise<Context> {
  const { req } = params;
  let user = null;
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.includes('Bearer')) {
      throw new GraphQLError('Invalid token');
    }

    const authToken = authHeader.replace('Bearer ', '');
    if (authToken) {
      const { userId } = await verifyToken(authToken);

      if (userId) {
        user = await prisma.user.findFirstOrThrow({
          where: { id: userId },
        });
      }
    }
    user = user || null;
  } catch (error) {
    user = null;
  }
  return {
    user,
    req,
    prisma,
  };
}
