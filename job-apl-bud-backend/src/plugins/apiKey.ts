import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";

async function apiKeyPlugin(app: FastifyInstance) {
  app.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.url === "/health") return;

      const apiKey = request.headers["x-api-key"];

      if (!apiKey || apiKey !== process.env.API_KEY) {
        return reply
          .code(401)
          .send({ error: "Unauthorized — invalid or missing API key" });
      }
    },
  );
}

export default fp(apiKeyPlugin);
