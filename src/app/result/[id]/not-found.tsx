import { ButtonLink } from "@/components/ui/button-link";

export default function ResultNotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl" aria-hidden>
        ⌛
      </p>
      <h1 className="mt-4 text-2xl font-extrabold">This result has expired</h1>
      <p className="mt-2 text-muted-foreground">Results are deleted after 7 days to protect everyone&apos;s privacy.</p>
      <ButtonLink href="/create" variant="gradient" size="lg" className="mt-6 w-full">
        Make your own quiz
      </ButtonLink>
    </div>
  );
}
