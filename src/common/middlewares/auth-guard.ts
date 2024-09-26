import { Context } from './../../context';
import { Args, Parent, ResolverHandler } from './../../types';
import { ERROR_MESSAGES } from '../errors/error-messages';
import { verifyToken } from './../../utils';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

type ResolverMiddleware = (next: ResolverHandler<any>) => any;

export const authGuard: ResolverMiddleware = (next) => {
  return async (
    parent: Parent,
    args: Args<{}>,
    context: Context,
    info: GraphQLResolveInfo,
  ) => {
    if (!context.user) {
      throw new GraphQLError(ERROR_MESSAGES.UNAUTHENTICATED, {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
      throw new GraphQLError(ERROR_MESSAGES.UNAUTHENTICATED, {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new GraphQLError(ERROR_MESSAGES.UNAUTHENTICATED, {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }

    const { userId } = await verifyToken(
      token,
      process.env.JWT_ACCESS_SECRET_KEY,
    );

    if (context.user.id !== userId) {
      throw new GraphQLError(ERROR_MESSAGES.UNAUTHENTICATED, {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }
    return next(parent, args, context, info);
  };
};
