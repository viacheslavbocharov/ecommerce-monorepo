import { UserRole } from "../auth/user-role.type";

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  } | null;
}
