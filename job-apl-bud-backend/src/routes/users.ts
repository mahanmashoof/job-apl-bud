import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function userRoutes(app: FastifyInstance) {
  // Get all users
  app.get("/users", async (request, reply) => {
    const allUsers = await db.select().from(users);
    return allUsers;
  });

  // Create a user
  app.post("/users", async (request, reply) => {
    const { email, name } = request.body as {
      email: string;
      name?: string;
    };

    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
      })
      .returning();

    return reply.code(201).send(newUser[0]);
  });

  // Get a single user
  app.get("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await db.select().from(users).where(eq(users.id, id));

    if (!user.length) {
      return reply.code(404).send({ error: "User not found" });
    }

    return user[0];
  });
}
