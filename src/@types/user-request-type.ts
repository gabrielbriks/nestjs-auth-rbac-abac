import { Roles } from '@prisma/client';

export type UserRequestType = {
  id: string;
  name: string;
  email: string;
  role: Roles;
};
