"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 text-center" role="alert">
      <p className="text-5xl" aria-hidden>
        😵‍💫
      </p>
      <h1 className="mt-4 text-2xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">It&apos;s us, not you. Please try again in a moment.</p>
      <div className="mt-6 grid w-full grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => router.push("/")}>
          Home
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
