import { UserRole } from '@repo/db/types'
import { atomWithQuery } from 'jotai-tanstack-query'
import { apiClient } from '~/utils/axios'
import { authTokenAtom } from './token'

export const userAtom = atomWithQuery<UserMe>((_) => {
  return {
    queryKey: ['userAtom'],
    queryFn: async () =>
      apiClient
        .get('/user/me')
        .then((res) => res.data.data)
        .catch((error) => {
          if (error.response?.status === 401) {
            throw new Error('Unauthorized access - please log in again', {
              cause: error,
            })
          } else {
            throw new Error(`Failed to fetch user data: ${error.message}`, {
              cause: error,
            })
          }
        }),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: 1000 * 60, // 1 minute
    retry: 2,
  }
})

export type UserSecurityInfo = {
  has_pin: boolean
  is_kyc: boolean
  has_passkey: boolean
}

export const userSecurityAtom = atomWithQuery<UserSecurityInfo | null>((get) => {
  const tokens = get(authTokenAtom)
  const userResult = get(userAtom)
  const user = userResult?.data

  const enabled = Boolean(tokens?.accessToken && user?.role && user.role !== UserRole.GUEST)
  const userId = user?.id ?? 'guest'

  return {
    queryKey: ['userSecurityInfo', userId],
    queryFn: async () =>
      apiClient
        .get('/user/security-info')
        .then((res) => res.data.data)
        .catch((error) => {
          throw new Error(error.response?.data?.message || 'Failed to fetch security info', {
            cause: error,
          })
        }),
    enabled,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    retry: 1,
  }
})

export type UserMe = {
  id: string
  balance: number
  name: string
  email: string
  image_url: string | null
  is_banned: boolean
  is_email_verified: boolean
  role: UserRole
  phone: string | null
}
