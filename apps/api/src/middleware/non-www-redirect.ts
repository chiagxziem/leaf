import { createMiddleware } from "hono/factory";

import HttpStatusCodes from "@/lib/http-status-codes";

export const nonWwwRedirect = createMiddleware(async (c, next) => {
  const host = c.req.header("host");

  if (host && host.startsWith("www.")) {
    const nonWwwHost = host.replace(/^www\./, "");
    const url = new URL(c.req.url);
    url.hostname = nonWwwHost;

    return c.redirect(url.toString(), HttpStatusCodes.MOVED_PERMANENTLY);
  }

  await next();
});
