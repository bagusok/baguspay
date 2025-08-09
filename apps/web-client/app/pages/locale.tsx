import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider, useAtom, useSetAtom } from "jotai";
import { queryClientAtom } from "jotai-tanstack-query";
import { useHydrateAtoms } from "jotai/utils";
import { useEffect } from "react";
import { Outlet } from "react-router";
import UserLayout from "~/components/layout/user-layout";
import NProgressBar from "~/components/n-progress-bar";
import { queryClient, store } from "~/store/store";
import { authTokenAtom } from "~/store/token";
import { userAtom } from "~/store/user";
import type { Route } from "./+types";

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

export default function Locale({ params, matches }: Route.ComponentProps) {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  const setAuthToken = useSetAtom(authTokenAtom);
  const [user] = useAtom(userAtom);

  useEffect(() => {
    if (user.isError) {
      console.error("Error loading user data:", user.error);
      setAuthToken(null);
    }
  }, [user]);

  if (user.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6"></div>
        <h2 className="text-xl font-semibold text-indigo-700 mb-2">
          Loading...
        </h2>
        <p className="text-indigo-500">
          Please wait while we prepare your content.
        </p>
      </div>
    );
  }

  if (user.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-500">Failed to load user data. Please Refresh</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <UserLayout>
          <Outlet />
        </UserLayout>
        <ReactQueryDevtools initialIsOpen={false} />
        <NProgressBar />
      </Provider>
    </QueryClientProvider>
  );
}
