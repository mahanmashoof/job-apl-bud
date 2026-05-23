import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { jobs, jobAnalyses } from "../db/schema";
import { eq } from "drizzle-orm";
import { analyzeJob } from "../ai/analyzeJob";

export async function analysisRoutes(app: FastifyInstance) {
  // Analyze a job
  app.post("/jobs/:id/analyze", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userSkills, userExperience } = request.body as {
      userSkills: string[];
      userExperience?: string;
    };

    // Fetch the job first
    const job = await db.select().from(jobs).where(eq(jobs.id, id));
    if (!job.length) {
      return reply.code(404).send({ error: "Job not found" });
    }

    // Run the AI pipeline
    const result = await analyzeJob({
      jobTitle: job[0].title,
      jobDescription: job[0].description,
      userSkills,
      userExperience,
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
