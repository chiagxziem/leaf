import { auth } from "@/lib/auth";

export type AppEnv = {
  Bindings: CloudflareBindings;
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
};

export type EncryptedNote = {
  contentEncrypted: string;
  contentIv: string;
  contentTag: string;
};
