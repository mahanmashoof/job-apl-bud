import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalyzeJobInput {
  jobTitle: string;
  jobDescription: string;
  userSkills: string[];
  userExperience?: string;
}

interface AnalyzeJobOutput {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
}

export async function analyzeJob(
  input: AnalyzeJobInput,
): Promise<AnalyzeJobOutput> {
  const { jobTitle, jobDescription, userSkills, userExperience } = input;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a career coach that analyzes job fit. 
You always respond with a JSON object in this exact shape:
{
  "matchScore": number between 0 and 100,
  "strengths": array of strings describing what the candidate does well for this role,
  "gaps": array of strings describing what the candidate is missing,
  "reasoning": short paragraph explaining the score
}`,
      },
      {
        role: "user",
        content: `Analyze this job and candidate:

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Candidate Skills: ${userSkills.join(", ")}
${userExperience ? `Candidate Experience: ${userExperience}` : ""}`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content) as AnalyzeJobOutput;
}
