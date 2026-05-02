"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-xl font-bold text-red-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-700">{error.message}</p>
        <Button className="mt-4" variant="destructive" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
