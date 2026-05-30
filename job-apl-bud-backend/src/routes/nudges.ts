import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { nudges } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateNudges } from "../ai/generateNudges";

export async function nudgeRoutes(app: FastifyInstance) {
  // Get nudges for a user — regenerates on every request
  app.get("/users/:id/nudges", async (request, reply) => {
    const { id } = request.params as { id: string };

    // Regenerate nudges fresh
    await generateNudges(id);

    // Return all nudges for this user
    const allNudges = await db
      .select()
      .from(nudges)
      .where(eq(nudges.userId, id))
      .orderBy(nudges.createdAt);

    return allNudges;
  });

  // Mark a nudge as read
  app.patch("/nudges/:id/read", async (request, reply) => {
    const { id } = request.params as { id: string };

    const updated = await db
      .update(nudges)
      .set({ isRead: "true", updatedAt: new Date() })
      .where(eq(nudges.id, id))
      .returning();

    if (!updated.length) {
      return reply.code(404).send({ error: "Nudge not found" });
    }

    return updated[0];
  });
}
