import "i18next";
import ns1 from "./en";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: "common";
    // custom resources type
    resources: typeof ns1;
    // other
  }
}
