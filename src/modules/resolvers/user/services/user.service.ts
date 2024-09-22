import { User } from '@prisma/client';
import { CreateUserInput, LoginInput } from '../dto/input';
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
  hashPassword,
  verifyToken,
} from './../../../../utils';
import { ERROR_MESSAGES } from './../../../../common/errors/error-messages';
import { GraphQLError } from 'graphql';

export class UserService {
  constructor(private readonly prisma: typeof __db__) {}

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
      },
    });
  }

  async login(
    input: LoginInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

    const refreshToken = await createRefreshToken(user.id);
    await this.prisma.user.update({
      data: { refreshToken: await hashPassword(refreshToken) },
      where: { id: user.id },
    });

    return {
      accessToken: await createAccessToken(user.id),
      refreshToken: await createRefreshToken(user.id),
    };
  }

  async refreshToken(refreshToken: string) {
    const decoded = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
    );

    if (!decoded.userId) {
      throw new GraphQLError(ERROR_MESSAGES.UNAUTHORIZED, {
        extensions: {
          code: 'UNAUTHORIZED',
        },
      });
    }

    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: decoded.userId },
    });

    const match = await comparePassword(
      refreshToken,
      user?.refreshToken ? user?.refreshToken : '',
    );

    if (!match) {
      throw new GraphQLError(ERROR_MESSAGES.UNAUTHORIZED, {
        extensions: {
          code: 'UNAUTHORIZED',
        },
      });
    }

    const newRefreshToken = await createRefreshToken(user.id);
    await this.prisma.user.update({
      data: { refreshToken: await hashPassword(newRefreshToken) },
      where: { id: user.id },
    });

    return {
      accessToken: await createAccessToken(user.id),
      refreshToken: newRefreshToken,
    };
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
