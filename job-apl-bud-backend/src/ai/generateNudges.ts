import { db } from "../db/client";
import { jobs, jobAnalyses, userProfiles, nudges } from "../db/schema";
import { eq } from "drizzle-orm";

const DAYS_UNTIL_APPLY_NUDGE = 3;
const DAYS_UNTIL_FOLLOWUP_NUDGE = 14;
const SKILL_GAP_PATTERN_THRESHOLD = 3;

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

interface NudgePayload {
  userId: string;
  jobId?: string;
  type:
    | "APPLY"
    | "FOLLOW_UP"
    | "SKILL_GAP_JOB"
    | "SKILL_GAP_PATTERN"
    | "GENERAL";
  message: string;
}

export async function generateNudges(userId: string): Promise<void> {
  const generated: NudgePayload[] = [];

  // Fetch all user's jobs
  const allJobs = await db.select().from(jobs).where(eq(jobs.userId, userId));

  // Fetch user profile
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));
  const hasProfile = profile.length > 0;

  // GENERAL — no profile yet
  if (!hasProfile) {
    generated.push({
      userId,
      type: "GENERAL",
      message:
        "You haven't added your CV yet — add it to unlock job analysis and CV optimization",
    });
  }

  // Track skill gaps across all jobs for pattern detection
  const gapFrequency: Record<string, number> = {};

  for (const job of allJobs) {
    const days = daysSince(new Date(job.createdAt));
    const updatedDays = daysSince(new Date(job.updatedAt));

    // APPLY — saved for 3+ days
    if (job.status === "SAVED" && days >= DAYS_UNTIL_APPLY_NUDGE) {
      generated.push({
        userId,
        jobId: job.id,
        type: "APPLY",
        message: `You saved ${job.title} at ${job.company} ${days} days ago — have you applied yet?`,
      });
    }

    // FOLLOW_UP — applied for 14+ days
    if (job.status === "APPLIED" && updatedDays >= DAYS_UNTIL_FOLLOWUP_NUDGE) {
      generated.push({
        userId,
        jobId: job.id,
        type: "FOLLOW_UP",
        message: `It's been ${updatedDays} days since you applied to ${job.title} at ${job.company} — consider following up`,
      });
    }

    // SKILL_GAP_JOB — saved job with analysis gaps
    if (job.status === "SAVED") {
      const analysis = await db
        .select()
        .from(jobAnalyses)
        .where(eq(jobAnalyses.jobId, job.id));

      if (analysis.length && analysis[0].gaps.length > 0) {
        generated.push({
          userId,
          jobId: job.id,
          type: "SKILL_GAP_JOB",
          message: `Before applying to ${job.title}, note these gaps: ${analysis[0].gaps.join(", ")}`,
        });

        // Count gap frequency for pattern detection
        for (const gap of analysis[0].gaps) {
          gapFrequency[gap] = (gapFrequency[gap] || 0) + 1;
        }
      }
    }
  }

  // SKILL_GAP_PATTERN — a gap appears across 3+ jobs
  for (const [gap, count] of Object.entries(gapFrequency)) {
    if (count >= SKILL_GAP_PATTERN_THRESHOLD) {
      generated.push({
        userId,
        type: "SKILL_GAP_PATTERN",
        message: `"${gap}" appears as a gap in ${count} of your jobs — consider addressing it`,
      });
    }
  }

  // Upsert all generated nudges
  for (const nudge of generated) {
    await db
      .insert(nudges)
      .values({
        userId: nudge.userId,
        jobId: nudge.jobId ?? null,
        type: nudge.type,
        message: nudge.message,
        isRead: "false",
      })
      .onConflictDoNothing();
  }
}
