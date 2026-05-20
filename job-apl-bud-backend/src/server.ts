import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

const app = Fastify();

app.register(cors, {
  origin: true,
});

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
