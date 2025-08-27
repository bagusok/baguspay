import { InferSelectModel } from '@repo/db';
import { tb, UserRegisteredType, UserRole } from '@repo/db/types';

export const GUEST_USER: InferSelectModel<typeof tb.users> = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'guest@baguspay.web.id',
  name: 'Guest User',
  role: UserRole.GUEST,
  balance: 0,
  created_at: new Date(0),
  updated_at: new Date(0),
  image_url: null,
  is_banned: false,
  is_email_verified: false,
  registered_type: UserRegisteredType.LOCAL,
  phone: null,
  deleted_at: null,
  is_deleted: false,
  oauth_id: null,
  password: 'ini_password_guest_user_baguspay',
};
