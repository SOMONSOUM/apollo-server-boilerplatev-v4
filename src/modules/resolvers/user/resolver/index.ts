import { User } from '@prisma/client';
import { ResolverHandler } from './../../../../types';
import { CreateUserInput, LoginInput, RefreshTokenInput } from '../dto/input';
import { UserService } from '../services/user.service';
import { authGuard } from './../../../../common/middlewares';
import { LoginResponse } from '../dto/response';

export const users: ResolverHandler<User[]> = async (
  _,
  input,
  { prisma },
  info,
) => {
  const userService = new UserService(prisma);
  return await userService.getUsers();
};

export const createUser: ResolverHandler<
  User,
  { input: CreateUserInput }
> = async (_, { input }, { prisma }, info) => {
  const userService = new UserService(prisma);
  return await userService.createUser(input);
};

export const login: ResolverHandler<
  LoginResponse,
  { input: LoginInput }
> = async (_, { input }, { prisma }, info) => {
  const userService = new UserService(prisma);

  return await userService.login(input);
};

export const me: ResolverHandler<User | null> = async (
  _,
  args,
  { user },
  info,
) => {
  return user;
};

export const refreshToken: ResolverHandler<
  LoginResponse,
  { input: RefreshTokenInput }
> = async (_, { input }, { prisma }, info) => {
  const userService = new UserService(prisma);
  return await userService.refreshToken(input.refreshToken);
};

export const userResolver = {
  Query: {
    getUsers: authGuard(users),
    me: authGuard(me),
  },
  Mutation: {
    createUser: authGuard(createUser),
    login,
    refreshToken,
  },
};
