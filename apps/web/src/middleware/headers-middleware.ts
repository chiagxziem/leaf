import { createMiddleware } from "@tanstack/react-start";

export const headersMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const headers: Record<string, string> = {};

    const cookie = request.headers.get("cookie");
    const authorization = request.headers.get("authorization");

    if (cookie) headers.cookie = cookie;
    if (authorization) headers.authorization = authorization;

    return next({
      context: {
        headers,
      },
    });
  },
);
