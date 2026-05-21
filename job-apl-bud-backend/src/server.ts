import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";
import { jobRoutes } from "./routes/jobs";
import { userRoutes } from "./routes/users";

const app = Fastify();

app.register(cors, {
  origin: true,
});
app.register(jobRoutes);
app.register(userRoutes);

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
