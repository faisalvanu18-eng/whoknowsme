import { ButtonLink } from "@/components/ui/button-link";

export default function DashboardNotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl" aria-hidden>
        🔐
      </p>
      <h1 className="mt-4 text-2xl font-extrabold">We couldn&apos;t find that dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        The link may be incomplete, or the quiz was deleted or expired. Check &quot;My quizzes&quot; on the device you used to create it.
      </p>
      <div className="mt-6 grid w-full gap-2">
        <ButtonLink href="/me" variant="secondary" size="lg">
          My quizzes on this device
        </ButtonLink>
        <ButtonLink href="/create" variant="gradient" size="lg">
          Make a new quiz
        </ButtonLink>
      </div>
    </div>
  );
}
