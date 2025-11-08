import * as argon2 from 'argon2';
export class CryptoService {
  hash(p: string) {
    return argon2.hash(p);
  }
  verify(h: string, p: string) {
    return argon2.verify(h, p);
  }
}
