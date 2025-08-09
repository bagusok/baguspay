import type { UserRole } from "@repo/db/types";
import { atomWithQuery } from "jotai-tanstack-query";
import { apiClient } from "~/utils/axios";

export const userAtom = atomWithQuery<UserMe>((get) => {
  return {
    queryKey: ["userAtom"],
    queryFn: async ({}) =>
      apiClient
        .get("/user/me")
        .then((res) => res.data.data)
        .catch((error) => {
          if (error.response?.status === 401) {
            throw new Error("Unauthorized access - please log in again", {
              cause: error,
            });
          } else {
            throw new Error("Failed to fetch user data", {
              cause: error,
            });
          }
        }),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: 1000 * 60, // 1 minute
    retry: 2,
  };
});

export type UserMe = {
  id: string;
  balance: number;
  name: string;
  email: string;
  image_url: string | null;
  is_banned: boolean;
  is_email_verified: boolean;
  role: UserRole;
  phone: string | null;
};
