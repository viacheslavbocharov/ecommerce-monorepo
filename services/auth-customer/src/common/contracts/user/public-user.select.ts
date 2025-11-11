export const publicUserSelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
      phone: true,
    },
  },
} as const;
