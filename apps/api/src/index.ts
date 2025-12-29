import { createApp } from "@/app";
import folder from "@/services/folder/folder.route";
import health from "@/services/health/health.route";
import note from "@/services/note/note.route";
import user from "@/services/user/user.route";

const app = createApp();

app
  .route("/health", health)
  .route("/user", user)
  .route("/folders", folder)
  .route("/notes", note);

export default app;
