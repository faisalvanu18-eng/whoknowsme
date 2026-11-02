import { ButtonLink } from "@/components/ui/button-link";

export default function QuizNotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl" aria-hidden>
        🫥
      </p>
      <h1 className="mt-4 text-2xl font-extrabold">This quiz isn&apos;t available</h1>
      <p className="mt-2 text-muted-foreground">It may have been deleted by its creator, expired, or the link is incomplete.</p>
      <ButtonLink href="/create" variant="gradient" size="lg" className="mt-6 w-full">
        Make your own quiz instead
      </ButtonLink>
    </div>
  );
}
