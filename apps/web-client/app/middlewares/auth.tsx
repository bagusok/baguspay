import type { MiddlewareFunction } from "react-router";

export const clientAuthMiddleware: MiddlewareFunction = ({ context }, next) => {
  console.log("Client auth middleware triggered");
};
