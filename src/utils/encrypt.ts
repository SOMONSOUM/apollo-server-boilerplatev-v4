import { GraphQLError } from 'graphql';
import * as jose from 'jose';

const alg = process.env.JWT_ALGO ?? 'HS256';

export const genKey = async (key: string | undefined) => {
  return new TextEncoder().encode(key);
};

export const createAccessToken = async (userId: number) => {
  const token = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1m')
    .sign(await genKey(process.env.JWT_ACCESS_SECRET_KEY));
  return token;
};

export const createRefreshToken = async (userId: number) => {
  const token = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7days')
    .sign(await genKey(process.env.JWT_REFRESH_SECRET_KEY));
  return token;
};

export const verifyToken = async (token: string, key: string | undefined) => {
  try {
    const privateKey = await genKey(key);
    const { payload } = await jose.jwtVerify(token, privateKey);
    return payload as { userId: number };
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new GraphQLError(error.message, {
        extensions: { code: error.code },
      });
    } else if (error instanceof jose.errors.JWTInvalid) {
      throw new GraphQLError(error.message, {
        extensions: { code: error.code },
      });
    }
    return { userId: undefined };
  }
};

export const decodeToken = (token: string) => {
  const decoded = jose.decodeJwt(token);
  return decoded as { userId: number };
};
