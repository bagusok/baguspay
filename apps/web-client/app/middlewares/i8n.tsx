import { createCookie } from "react-router";
import { unstable_createI18nextMiddleware } from "remix-i18next/middleware";
import en from "~/locales/en";
import id from "~/locales/id";
import ms from "~/locales/ms";

export const localeCookie = createCookie("lng", {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
});

export const [i18nextMiddleware, getLocale, getInstance] =
  unstable_createI18nextMiddleware({
    detection: {
      supportedLanguages: ["id", "en", "ms"],
      fallbackLanguage: "id",
      order: ["cookie", "header", "session"],
      // findLocale: async (request) => {
      //   const supported = ["id", "en"];
      //   const locale = new URL(request.url).pathname.split("/").at(1);
      //   if (supported.includes(locale ?? "")) {
      //     return locale as "id" | "en";
      //   }
      //   return "id";
      // },
      cookie: localeCookie,
    },
    i18next: {
      fallbackLng: "id",
      supportedLngs: ["id", "en", "ms"],
      lowerCaseLng: true,
      resources: { en: en, id: id, ms: ms },
    },
  });
