import bcrypt from 'bcryptjs';
import { PasswordHasherPort } from '@domain/auth/services';

export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(plain: string): Promise<string> {
    return await bcrypt.hash(plain, 10);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}