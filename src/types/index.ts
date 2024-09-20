import type { GraphQLResolveInfo } from 'graphql';
import { Context } from '~/context';

export interface Args<T = any, ID = any> {
  input: T;
  id: ID;
}

export type ID = number;

// Parent type, can be extended if needed
export interface Parent {}

// Custom resolver handler with generics for return type and args type
export type ResolverHandler<ReturnType = any, ArgsType = Args> = (
  parent: Parent,
  args: ArgsType,
  context: Context,
  info: GraphQLResolveInfo,
) => Promise<ReturnType>; // Return a Promise, since resolvers are async

// Optional type interface for mutation or response confirmation
export interface OK {
  ok: boolean;
}

// restful api types

export enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export interface Route {
  method: Methods;
  url: string;
  handlers: any | any[];
}

export interface Response {
  code?: number;
  msg?: string;
  data?: any;
}
