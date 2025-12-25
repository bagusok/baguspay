import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
} from "react-router";

import { cn } from "@repo/ui/lib/utils";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ScrollRestoration } from "react-router";
import { useChangeLanguage } from "remix-i18next/react";
import type { Route } from "./+types/root";
import "./app.css";
import { RouterTopLoader } from "./components/top-loader";
import {
  getInstance,
  i18nextMiddleware,
  localeCookie,
} from "./middlewares/i8n";
import { getSession } from "./session.server";

export const unstable_middleware = [i18nextMiddleware];

export async function loader({ context, request, params }: Route.LoaderArgs) {
  let i18next = getInstance(context);
  const url = new URL(request.url);
  const supportedLangs = ["en", "id", "ms"];

  // Ambil param locale dari path
  let pathParts = url.pathname.split("/").filter(Boolean);
  let localeParam = pathParts[0];
  // Ambil locale dari cookie
  let cookieLocale =
    (await localeCookie.parse(request.headers.get("Cookie"))) || null;

  // Urutan: param > cookie > default
  let redirectLang = "id";
  if (localeParam && supportedLangs.includes(localeParam)) {
    redirectLang = localeParam;
  } else if (cookieLocale && supportedLangs.includes(cookieLocale)) {
    redirectLang = cookieLocale;
  }

  // Jika path tidak diawali localization
  if (!localeParam || !supportedLangs.includes(localeParam)) {
    // Build new path dengan menambahkan locale di depan, path tetap utuh
    let newPath = url.pathname;
    // pastikan tidak double slash
    newPath = newPath.startsWith("/") ? newPath : `/${newPath}`;
    return redirect(`/${redirectLang}${newPath}`, {
      headers: { "Set-Cookie": await localeCookie.serialize(redirectLang) },
    });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const flashSuccess = session.get("success");
  const flashError = session.get("error");

  // jika sudah match, set locale sesuai param
  await i18next.changeLanguage(localeParam);

  return data(
    {
      locale: localeParam,
      flash: {
        success: flashSuccess,
        error: flashError,
      },
    },
    { headers: { "Set-Cookie": await localeCookie.serialize(localeParam) } }
  );
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  let { i18n } = useTranslation("common");

  return (
    <html lang={i18n.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn("antialiased relative")}>
        <RouterTopLoader />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  useChangeLanguage(loaderData.locale);

  useEffect(() => {
    if (loaderData?.flash.success) {
      toast.success(loaderData.flash?.success ?? "");
    }

    if (loaderData?.flash.error) {
      toast.error(loaderData.flash?.error ?? "");
    }
    console.log("Flash messages:", loaderData?.flash);
  }, [loaderData?.flash]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
