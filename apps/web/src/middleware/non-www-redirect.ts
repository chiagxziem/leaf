import { createMiddleware } from "@tanstack/react-start";

export const nonWwwRedirectMdw = createMiddleware().server(async ({ next, request }) => {
  const host = request.headers.get("host");

  if (host && host.startsWith("www.")) {
    const nonWwwHost = host.replace(/^www\./, "");
    const url = new URL(request.url);
    url.hostname = nonWwwHost;

    return Response.redirect(url.toString(), 301);
  }

  return next();
});
