import { JwtPayload } from 'jsonwebtoken';

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const isAuthTokenPayload = (
  value: unknown,
): value is AuthTokenPayload => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<AuthTokenPayload>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.role === 'string'
  );
};
