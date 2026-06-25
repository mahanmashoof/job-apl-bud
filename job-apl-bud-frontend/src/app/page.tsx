"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import AddJobModal from "@/components/AddJobModal";
import { useRouter } from "next/navigation";

const STATUS_COLUMNS = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;
type Status = (typeof STATUS_COLUMNS)[number];

const STATUS_LABELS: Record<Status, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<Status, string> = {
  SAVED: "bg-gray-100 text-gray-700",
  APPLIED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  OFFER: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

interface Job {
  id: string;
  title: string;
  company: string;
  status: Status;
  createdAt: string;
}

export default function Home() {
  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.getJobs(),
  });
  const router = useRouter();
  const [showAddJob, setShowAddJob] = useState(false);

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading jobs...</p>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Error connecting to API</p>
      </div>
    );

  const jobsByStatus = STATUS_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((job: Job) => job.status === status);
      return acc;
    },
    {} as Record<Status, Job[]>,
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">job-apl-bud</h1>
        <button
          onClick={() => setShowAddJob(true)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Job
        </button>
      </div>

      {/* Pipeline board */}
      <div className="p-8 flex gap-4 overflow-x-auto">
        {STATUS_COLUMNS.map((status) => (
          <div key={status} className="shrink-0 w-72">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
              <span className="text-xs text-gray-400">
                {jobsByStatus[status].length}
              </span>
            </div>

            {/* Job cards */}
            <div className="flex flex-col gap-2">
              {jobsByStatus[status].map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {job.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{job.company}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}

              {jobsByStatus[status].length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-400">No jobs</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {showAddJob && <AddJobModal onClose={() => setShowAddJob(false)} />}
    </main>
  );
}
