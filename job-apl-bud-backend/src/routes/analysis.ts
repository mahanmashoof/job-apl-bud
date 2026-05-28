import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { jobs, jobAnalyses, userProfiles } from "../db/schema";
import { eq } from "drizzle-orm";
import { analyzeJob } from "../ai/analyzeJob";

export async function analysisRoutes(app: FastifyInstance) {
  // Analyze a job
  app.post("/jobs/:id/analyze", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.body as { userId: string };

    // Fetch the job first
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
    const result = await analyzeJob({
      jobTitle: job[0].title,
      jobDescription: job[0].description,
      userSkills: profile[0].skills,
      userExperience: profile[0].experience ?? undefined,
    });

    // Save the analysis to the database
    const saved = await db
      .insert(jobAnalyses)
      .values({
        jobId: id,
        matchScore: result.matchScore,
        strengths: result.strengths,
        gaps: result.gaps,
        reasoning: result.reasoning,
      })
      .onConflictDoUpdate({
        target: jobAnalyses.jobId,
        set: {
          matchScore: result.matchScore,
          strengths: result.strengths,
          gaps: result.gaps,
          reasoning: result.reasoning,
          updatedAt: new Date(),
        },
      })
      .returning();

    return reply.code(201).send(saved[0]);
  });

  // Get analysis for a job
  app.get("/jobs/:id/analyze", async (request, reply) => {
    const { id } = request.params as { id: string };

    const analysis = await db
      .select()
      .from(jobAnalyses)
      .where(eq(jobAnalyses.jobId, id));

    if (!analysis.length) {
      return reply.code(404).send({ error: "No analysis found for this job" });
    }

    return analysis[0];
  });
}
