import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route(":locale", "pages/locale.tsx", [
    index("pages/index.tsx"),

    ...prefix("api", [route("locales/:ns", "api/locales/index.ts")]),

    ...prefix("auth", [
      route("login", "pages/auth/login.tsx"),
      route("register", "pages/auth/register.tsx"),
    ]),

    ...prefix("order", [
      route("detail/:id", "pages/order/detail/index.tsx"),
      route(":slug", "pages/order/slug.tsx"),
    ]),

    route("about", "pages/about.tsx"),
    route("contact", "pages/contact.tsx"),
    route("privacy-policy", "pages/privacy-policy.tsx"),
    route("terms-of-service", "pages/terms.tsx"),
    route("faq", "pages/faq.tsx"),
    route("support", "pages/support.tsx"),

    route("check-order", "pages/check-order.tsx"),

    ...prefix("blog", [
      index("pages/blog/index.tsx"),
      route("offers", "pages/blog/offers/index.tsx"),
      route("offers/:slug", "pages/blog/offers/detail.tsx"),
      route(":slug", "pages/blog/detail.tsx"),
    ]),

    // prootected routes
    route("", "pages/protected/protected.tsx", [
      route("user", "pages/protected/user/layout.tsx", [
        index("pages/protected/user/index.tsx"),
        route("profile", "pages/protected/user/profile.tsx"),
        route("deposit", "pages/protected/user/deposit/index.tsx"),
        route("orders", "pages/protected/user/order-history.tsx"),
        route("deposit/history", "pages/protected/user/deposit/history.tsx"),
        route("deposit/history/:id", "pages/protected/user/deposit/detail.tsx"),
      ]),
    ]),

    route("*", "pages/not-found.tsx"),
  ]),

  // route("*", "pages/not-found.tsx"),

  //   route("*", "pages/not-found.tsx"),
  // ]),

  // route("*", "pages/not-found.tsx"),
] satisfies RouteConfig;
