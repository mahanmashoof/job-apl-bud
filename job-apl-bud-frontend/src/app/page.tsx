"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.getJobs(),
  });

  if (isLoading) return <p className="p-8">Loading...</p>;
  if (isError)
    return <p className="p-8 text-red-500">Error connecting to API</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">job-apl-bud</h1>
      <pre className="text-sm bg-white p-4 rounded border">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
