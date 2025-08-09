import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useLocale } from "remix-i18next/react";
import { isAccessTokenExpiredAtom, isAuthenticatedAtom } from "~/store/token";

export default function Protected() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const isExpiredAccessToken = useAtomValue(isAccessTokenExpiredAtom);

  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const locale = useLocale();
  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isExpiredAccessToken) {
      navigate(`/${locale}/auth/login`, { replace: true });
    }
  }, [isAuthenticated, isExpiredAccessToken]);

  if (isLoading) {
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

  return <Outlet />;
}
