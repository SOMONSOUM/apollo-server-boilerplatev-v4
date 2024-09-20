import { Context } from '~/context';
import { Args, Parent, ResolverHandler } from '~/types';
import { UNAUTHENTICATED, UNAUTHORIZED } from '../errors';
import { ERROR_MESSAGES } from '../errors/error-messages';
import { verifyToken } from '~/utils';
import { GraphQLResolveInfo } from 'graphql';

type ResolverMiddleware = (next: ResolverHandler<any>) => any;

export const authGuard: ResolverMiddleware = (next) => {
  return async (
    parent: Parent,
    args: Args<{}>,
    context: Context,
    info: GraphQLResolveInfo,
  ) => {
    if (!context.user) {
      throw new UNAUTHENTICATED(ERROR_MESSAGES.UNAUTHENTICATED);
    }
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
      throw new UNAUTHENTICATED(ERROR_MESSAGES.UNAUTHENTICATED);
    }
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new UNAUTHENTICATED(ERROR_MESSAGES.UNAUTHENTICATED);
    }

    const { userId } = await verifyToken(token);

    if (context.user.id !== userId) {
      throw new UNAUTHORIZED(ERROR_MESSAGES.UNAUTHORIZED);
    }
    return next(parent, args, context, info);
  };
};
