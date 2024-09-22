import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class Cryptography {
  private readonly secret: Buffer;

  constructor(secret: string) {
    this.secret = Buffer.from(secret, 'utf8');
  }

  encrypt(text: string) {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.secret, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  }

  decrypt(cipherText: string) {
    const [ivHex, encryptedHex] = cipherText.split(':');
    const iv = Buffer.from(ivHex, 'base64');
    const encryptedText = encryptedHex;
    const decipher = createDecipheriv('aes-256-cbc', this.secret, iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
