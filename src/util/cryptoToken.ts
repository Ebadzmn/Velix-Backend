import crypto from 'crypto';

export const generateCryptoToken = (bytes = 32): { rawToken: string; hashedToken: string } => {
  const rawToken = crypto.randomBytes(bytes).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};
