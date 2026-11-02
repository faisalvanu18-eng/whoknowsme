import type { Metadata } from "next";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl" aria-hidden>
        📡
      </p>
      <h1 className="mt-4 text-2xl font-extrabold">You&apos;re offline</h1>
      <p className="mt-2 text-muted-foreground">Quizzes need a connection to load and score. Check your signal and try again.</p>
      {/* Full page load on purpose: client-side navigation cannot work while offline. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="mt-6 inline-flex h-12 items-center rounded-2xl bg-primary px-6 font-bold text-white">
        Try again
      </a>
    </div>
  );
}
