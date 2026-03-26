import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider, useAtom, useSetAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import UserLayout from '~/components/layout/user-layout'
import SetPinWrapper from '~/components/set-pin-wrapper'
import { queryClient, store } from '~/store/store'
import { authTokenAtom } from '~/store/token'
import { userAtom } from '~/store/user'
import type { Route } from './+types'

// export const loader = async ({
//   params,
//   request,

//   context,
// }: Route.LoaderArgs) => {
//   const url = new URL(request.url);

//   const locale = params.locale;
//   let i18next = getInstance(context);

//   // check locale match atau tidak
//   if (!locale || !i18next.languages.includes(locale)) {
//     // jika tidak cocok, redirect ke default locale
//     await i18next.changeLanguage(locale || "id");
//     return redirect(`/${i18next.language}${url.pathname}`);
//   }

//   return null; // or return some data if required
// };

export default function Locale(_args: Route.ComponentProps) {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  const setAuthToken = useSetAtom(authTokenAtom)
  const [user] = useAtom(userAtom)
  const navigate = useNavigate()

  useEffect(() => {
    if (user.isError) {
      setAuthToken(null)
      navigate('/auth/login')
    }
  }, [user.isError, navigate, setAuthToken])

  if (user.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-100 to-indigo-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6"></div>
        <h2 className="text-xl font-semibold text-indigo-700 mb-2">Loading...</h2>
        <p className="text-indigo-500">Please wait while we prepare your content.</p>
      </div>
    )
  }

  if (user.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-500">
          Failed to load user data. Please Refresh, {user.error.toString()}
        </p>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SetPinWrapper>
          <UserLayout>
            <Outlet />
          </UserLayout>
        </SetPinWrapper>
        <ReactQueryDevtools initialIsOpen={false} />
      </Provider>
    </QueryClientProvider>
  )
}
