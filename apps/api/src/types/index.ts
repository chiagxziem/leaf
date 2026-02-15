import type { Database } from "@repo/db";

import { auth } from "@/lib/auth";

export type AppEnv = {
  Bindings: CloudflareBindings;
  Variables: {
    user: typeof auth.$Infer.Session.user;
    db: Database;
  };
};

export type EncryptedNote = {
  contentEncrypted: string;
  contentIv: string;
  contentTag: string;
};
