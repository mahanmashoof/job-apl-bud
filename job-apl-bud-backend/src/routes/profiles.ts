import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { userProfiles, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { extractProfile } from "../ai/extractProfile";

export async function profileRoutes(app: FastifyInstance) {
  // Create or update profile from raw CV
  app.post("/users/:id/profile", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { cvText } = request.body as { cvText: string };

    // Check user exists
    const user = await db.select().from(users).where(eq(users.id, id));
    if (!user.length) {
      return reply.code(404).send({ error: "User not found" });
    }

    // Run AI extraction
    const extracted = await extractProfile(cvText);

    // Upsert — create if not exists, update if it does
    const saved = await db
      .insert(userProfiles)
      .values({
        userId: id,
        baseCV: cvText,
        skills: extracted.skills,
        experience: extracted.experience,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          baseCV: cvText,
          skills: extracted.skills,
          experience: extracted.experience,
          updatedAt: new Date(),
        },
      })
      .returning();

    return reply.code(201).send(saved[0]);
  });

  // Get profile for a user
  app.get("/users/:id/profile", async (request, reply) => {
    const { id } = request.params as { id: string };

    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, id));

    if (!profile.length) {
      return reply.code(404).send({ error: "No profile found for this user" });
    }

    return profile[0];
  });
}
