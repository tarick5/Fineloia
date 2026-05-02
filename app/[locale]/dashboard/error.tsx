"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5">
      <p className="font-semibold text-red-900">Dashboard error</p>
      <p className="mt-2 text-sm text-red-700">{error.message}</p>
      <Button className="mt-4" variant="destructive" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
