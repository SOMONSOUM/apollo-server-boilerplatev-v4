import { GraphQLResolveInfo } from 'graphql';
import { Context } from '~/context';
import { Args, Parent, ResolverHandler } from '~/types';

type ResolverMiddleware = (next: ResolverHandler<any>) => any;

export const refreshTokenGuard: ResolverMiddleware = (next) => {
  return async (
    parent: Parent,
    args: Args<{}>,
    context: Context,
    info: GraphQLResolveInfo,
  ) => {
    return next(parent, args, context, info);
  };
};
