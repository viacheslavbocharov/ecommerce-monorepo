import type { UserRole } from "../auth/user-role.type.ts";

export interface JwtBasePayload {
  sub: string;
  role: UserRole;
}

export interface JwtAccessPayload extends JwtBasePayload {
  type: "access";
}

export interface JwtRefreshPayload extends JwtBasePayload {
  type: "refresh";
  jti: string;
  iat?: number;
  exp?: number;
}
