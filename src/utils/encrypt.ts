import * as jose from 'jose';

const alg = process.env.JWT_ALGO ?? 'HS256';

const genKey = async () => {
  return new TextEncoder().encode(process.env.JWT_SECRET_KEY);
};

export const createToken = async (userId: number) => {
  const token = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(await genKey());
  return token;
};

export const verifyToken = async (token: string) => {
  const privateKey = await genKey();
  const { payload } = await jose.jwtVerify(token, privateKey);
  return payload as { userId: number };
};

export const decodeToken = (token: string) => {
  const decoded = jose.decodeJwt(token);
  return decoded as { userId: number };
};
