import type { Metadata } from "next";
import { MyQuizzes } from "@/components/dashboard/my-quizzes";

export const metadata: Metadata = {
  title: "My quizzes on this device",
  robots: { index: false, follow: true },
};

export default function MePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
      <h1 className="text-3xl font-extrabold">My quizzes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Saved only in this browser. Clearing your browser data removes this list, so keep your private results links somewhere safe.
      </p>
      <div className="mt-6">
        <MyQuizzes />
      </div>
    </div>
  );
}
