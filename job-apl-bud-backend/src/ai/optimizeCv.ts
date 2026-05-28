import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OptimizeCVInput {
  jobTitle: string;
  jobDescription: string;
  baseCV: string;
}

interface OptimizeCVOutput {
  content: string;
  changes: string[];
  explanation: string;
}

export async function optimizeCV(
  input: OptimizeCVInput,
): Promise<OptimizeCVOutput> {
  const { jobTitle, jobDescription, baseCV } = input;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert CV writer. Your job is to tailor a candidate's CV to a specific job posting.
You make targeted improvements without inventing experience or skills the candidate doesn't have.
IMPORTANT: Never add skills, tools, or technologies that are not already present in the original CV.
You may reorder, reframe, or reword existing content to better match the job — but only use what is already there.
Respond with a JSON object in this exact shape:
{
  "content": the full optimized CV text,
  "changes": array of specific changes made, e.g. "Moved React to top of skills section",
  "explanation": a short paragraph explaining the overall optimization strategy
}`,
      },
      {
        role: "user",
        content: `Tailor this CV for the following job.

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Original CV:
${baseCV}`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content) as OptimizeCVOutput;
}
