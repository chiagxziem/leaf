import { createRouter } from "@/app";
import HttpStatusCodes from "@/lib/http-status-codes";
import { successResponse } from "@/lib/utils";
import { checkHealthDoc } from "./health.docs";

const health = createRouter();

health.get("/", checkHealthDoc, (c) => {
  return c.json(
    successResponse({ status: "ok" }, "API is healthy"),
    HttpStatusCodes.OK,
  );
});

export default health;
