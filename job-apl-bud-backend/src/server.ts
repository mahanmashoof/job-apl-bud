import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";
import { jobRoutes } from "./routes/jobs";
import { userRoutes } from "./routes/users";
import { analysisRoutes } from "./routes/analysis";
import { profileRoutes } from "./routes/profiles";
import { cvVersionRoutes } from "./routes/cvVersions";
import { nudgeRoutes } from "./routes/nudges";
import apiKeyPlugin from "./plugins/apiKey";

const app = Fastify();

app.register(cors, {
  origin: true,
});
app.register(apiKeyPlugin);
app.register(jobRoutes);
app.register(userRoutes);
app.register(analysisRoutes);
app.register(profileRoutes);
app.register(cvVersionRoutes);
app.register(nudgeRoutes);

app.get("/health", async () => {
  return { status: "ok" };
});

const start = async () => {
  try {
    await app.listen({ port: 3001, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
