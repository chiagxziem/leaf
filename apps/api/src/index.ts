import { createApp } from "@/app";
import folder from "@/services/folder/folder.route";
import health from "@/services/health/health.route";
import note from "@/services/note/note.route";
import user from "@/services/user/user.route";

const app = createApp();

app.route("/api/health", health);
app.route("/api/user", user);
app.route("/api/folders", folder);
app.route("/api/notes", note);

export default {
  port: 8000,
  fetch: app.fetch,
};
