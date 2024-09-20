import { PrismaClient, User } from '@prisma/client';
import { CreateUserInput, LoginInput } from '../dto/input';
import {
  comparePassword,
  createToken,
  hashPassword,
} from './../../../../utils';
import { ERROR_MESSAGES } from './../../../../common/errors/error-messages';
import { GraphQLError } from 'graphql';

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
      },
    });
  }

  async login(input: LoginInput): Promise<string> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { email: input.email },
    });

    if (!user) {
      throw new GraphQLError(ERROR_MESSAGES.UNAUTHENTICATED, {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }

    const matchPassword = await comparePassword(input.password, user.password);

    if (!matchPassword) {
      throw new GraphQLError('Password does match the existing', {
        extensions: {
          code: 'UNAUTHORIZED',
        },
      });
    }

    return await createToken(user.id);
  }

  async createUser(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...input,
        password: await hashPassword(input.password),
      },
    });
  }
}
