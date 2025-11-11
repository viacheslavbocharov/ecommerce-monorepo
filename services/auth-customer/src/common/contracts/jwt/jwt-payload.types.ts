export interface JwtRefreshPayload {
  sub: string;
  role: string;
  jti: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
}
