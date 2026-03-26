import type { UserRole } from '@repo/db/types'

export interface MetaPaginated {
  meta: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface TUser {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: Date
  updated_at: Date
  balance: number
  is_email_verified: boolean
  phone: string | null
  is_banned: boolean
  image_url: string | null
  pin_hash?: string | null
  pin_attempts?: number
  pin_locked_until?: Date | null
  pin_set_at?: Date | null
}
