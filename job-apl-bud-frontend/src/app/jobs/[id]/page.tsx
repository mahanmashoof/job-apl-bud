"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function JobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api.getJob(id),
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{job?.title}</h1>
          <p className="text-sm text-gray-500">{job?.company}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-3xl mx-auto flex flex-col gap-6">
        {/* Job description */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Job Description
          </h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {job?.description}
          </p>
          {job?.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline mt-3 block"
            >
              View original posting →
            </a>
          )}
        </section>
      </div>
    </main>
  );
}
