// auth
export type RegisterDto = { email: string; password: string };
export type LoginDto    = { email: string; password: string };
export type MeDto       = { id: string; email: string; role: "customer"|"admin"|"super_admin" };
