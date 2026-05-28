import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractProfileOutput {
  skills: string[];
  experience: string;
}

export async function extractProfile(
  cvText: string,
): Promise<ExtractProfileOutput> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a CV parser. Extract structured data from a CV and respond with a JSON object in this exact shape:
{
  "skills": array of specific technical and professional skills found in the CV,
  "experience": a concise 2-3 sentence summary of the candidate's overall experience and background
}`,
      },
      {
        role: "user",
        content: `Parse this CV and extract the structured data:\n\n${cvText}`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content) as ExtractProfileOutput;
}
