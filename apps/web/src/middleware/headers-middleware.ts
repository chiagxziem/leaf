import { createMiddleware } from "@tanstack/react-start";

export const headersMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    request.headers.delete("host");
    const headers = Object.fromEntries(request.headers.entries());

    return next({
      context: {
        headers,
      },
    });
  },
);
