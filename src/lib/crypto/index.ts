import {
  createCipheriv,
  createHash,
  createDecipheriv,
  randomBytes,
} from 'crypto';

export class Cryptography {
  private readonly secret: Buffer;

  /**
   * Creates a new instance of the Cryptography class.
   *
   * @param secret - The secret to be used for encryption and decryption.
   *                 The secret should be a string, and should be kept secret.
   */
  constructor(secret: string) {
    this.secret = Buffer.from(secret, 'utf8');
  }

  /**
   * Encrypts a given text using AES-256-CBC algorithm.
   * Generates a random initialization vector (IV) for each encryption.
   * The secret is hashed using SHA-256 to produce a 256-bit key.
   * Returns the encrypted text in base64 format, prefixed by the base64-encoded IV.
   *
   * @param text - The text to be encrypted.
   * @returns The encrypted text in the format 'iv:encrypted'.
   */
  encrypt(text: string) {
    const iv = randomBytes(16);
    const key = createHash('sha256').update(this.secret).digest();
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  }

  /**
   * Decrypts a given text using AES-256-CBC algorithm.
   * The given text should be in the format 'iv:encrypted'.
   * The secret is hashed using SHA-256 to produce a 256-bit key.
   * Returns the decrypted text in utf8 format.
   *
   * @param cipherText - The text to be decrypted, in the format 'iv:encrypted'.
   * @returns The decrypted text in utf8 format.
   */
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
