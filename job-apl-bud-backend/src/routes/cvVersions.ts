import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { jobs, cvVersions, userProfiles } from "../db/schema";
import { eq } from "drizzle-orm";
import { optimizeCV } from "../ai/optimizeCv";

export async function cvVersionRoutes(app: FastifyInstance) {
  // Generate or update a tailored CV for a job
  app.post("/jobs/:id/cv", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.body as { userId: string };

    // Fetch the job
    const job = await db.select().from(jobs).where(eq(jobs.id, id));
    if (!job.length) {
      return reply.code(404).send({ error: "Job not found" });
    }

    // Fetch the user profile
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    if (!profile.length) {
      return reply
        .code(404)
        .send({ error: "No profile found — create a profile first" });
    }

    // Run the AI pipeline
    const result = await optimizeCV({
      jobTitle: job[0].title,
      jobDescription: job[0].description,
      baseCV: profile[0].baseCV,
    });

    // Upsert — update if CV version already exists for this job
    const saved = await db
      .insert(cvVersions)
      .values({
        userId,
        jobId: id,
        content: result.content,
        changes: result.changes,
        explanation: result.explanation,
      })
      .onConflictDoUpdate({
        target: cvVersions.jobId,
        set: {
          content: result.content,
          changes: result.changes,
          explanation: result.explanation,
          updatedAt: new Date(),
        },
      })
      .returning();

    return reply.code(201).send(saved[0]);
  });

  // Get CV version for a job
  app.get("/jobs/:id/cv", async (request, reply) => {
    const { id } = request.params as { id: string };

    const cv = await db
      .select()
      .from(cvVersions)
      .where(eq(cvVersions.jobId, id));

    if (!cv.length) {
      return reply
        .code(404)
        .send({ error: "No CV version found for this job" });
    }

    return cv[0];
  });
}
