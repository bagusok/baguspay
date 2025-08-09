import type { unstable_MiddlewareFunction } from "react-router";

export const clientAuthMiddleware: unstable_MiddlewareFunction = (
  { context },
  next,
) => {
  console.log("Client auth middleware triggered");
};
