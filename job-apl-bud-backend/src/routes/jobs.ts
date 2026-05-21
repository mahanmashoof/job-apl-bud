import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { jobs } from "../db/schema";
import { eq } from "drizzle-orm";

export async function jobRoutes(app: FastifyInstance) {
  // Get all jobs
  app.get("/jobs", async (request, reply) => {
    const allJobs = await db.select().from(jobs);
    return allJobs;
  });

  // Add a job
  app.post("/jobs", async (request, reply) => {
    const { title, company, description, url, userId } = request.body as {
      title: string;
      company: string;
      description: string;
      url?: string;
      userId: string;
    };

    const newJob = await db
      .insert(jobs)
      .values({
        title,
        company,
        description,
        url,
        userId,
      })
      .returning();

    return reply.code(201).send(newJob[0]);
  });

  // Get a single job
  app.get("/jobs/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const job = await db.select().from(jobs).where(eq(jobs.id, id));

    if (!job.length) {
      return reply.code(404).send({ error: "Job not found" });
    }

    return job[0];
  });

  // Update job status
  app.patch("/jobs/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as {
      status: "SAVED" | "APPLIED" | "INTERVIEW" | "REJECTED" | "OFFER";
    };

    const updated = await db
      .update(jobs)
      .set({ status, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();

    if (!updated.length) {
      return reply.code(404).send({ error: "Job not found" });
    }

    return updated[0];
  });

  // Delete a job
  app.delete("/jobs/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const deleted = await db.delete(jobs).where(eq(jobs.id, id)).returning();

    if (!deleted.length) {
      return reply.code(404).send({ error: "Job not found" });
    }

    return reply.code(200).send({ message: "Job deleted" });
  });
}
