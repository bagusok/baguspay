import i18next from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import Fetch from "i18next-fetch-backend";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";

async function main() {
  await i18next
    .use(initReactI18next)
    .use(Fetch)
    .use(I18nextBrowserLanguageDetector)
    .init({
      defaultNS: "common",
      lowerCaseLng: true,
      detection: { order: ["cookie", "htmlTag"], caches: [] },
      load: "currentOnly",
      ns: ["common"],
      supportedLngs: ["id", "en", "ms"],
      backend: { loadPath: "/{{lng}}/api/locales/{{ns}}" },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
        {/* <Toaster position="top-center" reverseOrder={false} /> */}
      </I18nextProvider>,
    );
  });
}

main().catch((error) => console.error(error));
