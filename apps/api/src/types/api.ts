import { auth } from "@/lib/auth";

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
};
