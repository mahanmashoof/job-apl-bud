const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
export const USER_ID = process.env.NEXT_PUBLIC_USER_ID!;

async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY!,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API error");
  }

  return response.json();
}

export const api = {
  // Jobs
  getJobs: () => apiFetch("/jobs"),
  createJob: (data: {
    title: string;
    company: string;
    description: string;
    url?: string;
    userId: string;
  }) => apiFetch("/jobs", { method: "POST", body: JSON.stringify(data) }),
  updateJobStatus: (id: string, status: string) =>
    apiFetch(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteJob: (id: string) => apiFetch(`/jobs/${id}`, { method: "DELETE" }),

  // Analysis
  analyzeJob: (jobId: string, userId: string) =>
    apiFetch(`/jobs/${jobId}/analyze`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
  getAnalysis: (jobId: string) => apiFetch(`/jobs/${jobId}/analyze`),

  // CV
  generateCV: (jobId: string, userId: string) =>
    apiFetch(`/jobs/${jobId}/cv`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
  getCV: (jobId: string) => apiFetch(`/jobs/${jobId}/cv`),

  // Profile
  createProfile: (userId: string, cvText: string) =>
    apiFetch(`/users/${userId}/profile`, {
      method: "POST",
      body: JSON.stringify({ cvText }),
    }),
  getProfile: (userId: string) => apiFetch(`/users/${userId}/profile`),

  // Nudges
  getNudges: (userId: string) => apiFetch(`/users/${userId}/nudges`),
  markNudgeRead: (nudgeId: string) =>
    apiFetch(`/nudges/${nudgeId}/read`, {
      method: "PATCH",
      body: JSON.stringify({}),
    }),
};
