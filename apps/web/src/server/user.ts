import type { User } from "@repo/db/schemas/user.schema";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { isAxiosError } from "axios";

import { axiosClient, axiosErrMsg } from "@/lib/axios";
import { queryKeys } from "@/lib/query";
import type { ApiSuccessResponse } from "@/lib/types";
import { headersMiddleware } from "@/middleware/headers-middleware";

//* GET USER
// get user server fn
export const $getUser = createServerFn({
  method: "GET",
})
  .middleware([headersMiddleware])
  .handler(async ({ context }) => {
    try {
      const res = await axiosClient.get<ApiSuccessResponse<User>>("/user/me", {
        headers: context.headers,
      });

      return res.data.data;
    } catch (err) {
      if (isAxiosError(err)) {
        console.error("Error fetching user:", axiosErrMsg(err));
      }
      return null;
    }
  });
// get user query options
export const userQueryOptions = queryOptions({
  queryKey: queryKeys.user(),
  queryFn: $getUser,
});
