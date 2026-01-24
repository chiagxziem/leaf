import { createStart } from "@tanstack/react-start";

import { axiosErrorAdapter } from "@/lib/error";
import { nonWwwRedirectMdw } from "@/middleware/non-www-redirect";

export const startInstance = createStart(() => {
  return {
    serializationAdapters: [axiosErrorAdapter],
    requestMiddleware: [nonWwwRedirectMdw],
  };
});
