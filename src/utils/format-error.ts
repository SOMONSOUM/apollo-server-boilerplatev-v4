import type { GraphQLFormattedError } from 'graphql';

export function errorHandler(err: GraphQLFormattedError) {
  return {
    message: err.message ?? 'Internal server error',
    extensions: {
      code: err?.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
    },
  };
}
