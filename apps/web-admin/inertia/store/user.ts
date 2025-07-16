import { InferSelectModel } from '@repo/db'
import { tb } from '@repo/db/types'
import { atomWithQuery } from 'jotai-tanstack-query'
import { apiClient } from '~/utils/axios'

type User = InferSelectModel<typeof tb.users>

export const userAtom = atomWithQuery<User>(() => ({
  queryKey: ['me'],
  queryFn: async () =>
    apiClient
      .get('/admin/users/me')
      .then((res) => res.data)
      .catch((err) => {
        console.error('Failed to fetch user data:', err)
        throw new Error('Failed to fetch user data')
      }),
}))
