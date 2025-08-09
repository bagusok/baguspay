import type { Session } from "react-router";
import { createCookieSessionStorage, redirect } from "react-router";
import { ACCESS_TOKEN, REFRESH_TOKEN, SESSION_KEY } from "./common/constant";

type SessionData = {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    [key: string]: any;
  };
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiredAt?: number;
  refreshTokenExpiredAt?: number;
  deviceId?: string;
};

type SessionFlashData = {
  error: string;
  success: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: SESSION_KEY,

      // all of these are optional
      domain:
        process.env.NODE_ENV === "production" ? "baguspay.com" : undefined,
      httpOnly: true,
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secrets: [import.meta.env.VITE_SESSION_SECRET || "hfweriuhgfruiohgfuioh"],
      secure: true,
    },
  });

export function getTokenFromSession(session: Session) {
  return session.get(ACCESS_TOKEN) as string | undefined;
}

export function getRefreshTokenFromSession(session: Session) {
  return session.get(REFRESH_TOKEN) as string | undefined;
}

export function getDeviceIdFromSession(session: Session) {
  return session.get("deviceId") as string | undefined;
}

export function getUserFromSession(session: Session) {
  return session.get("user") as SessionData["user"] | undefined;
}

export function requireAuth(session: Session) {
  const accessToken = getTokenFromSession(session);
  if (!accessToken) {
    throw redirect("/login");
  }
  return accessToken;
}

export { commitSession, destroySession, getSession };
