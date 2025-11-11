export interface PublicUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  } | null;
}
