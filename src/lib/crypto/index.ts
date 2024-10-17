import {
  createCipheriv,
  createHash,
  createDecipheriv,
  randomBytes,
} from 'crypto';

export class Cryptography {
  private readonly secret: Buffer;

  constructor(secret: string) {
    this.secret = Buffer.from(secret, 'utf8');
  }

  encrypt(text: string) {
    const iv = randomBytes(16);
    const key = createHash('sha256').update(this.secret).digest();
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  }

  decrypt(cipherText: string) {
    const [ivBase64, encryptedBase64] = cipherText.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const key = createHash('sha256').update(this.secret).digest();
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
