import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-brand-gradient">404</p>
      <h1 className="mt-3 text-2xl font-extrabold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted-foreground">But your friendship quiz could, in about 30 seconds.</p>
      <div className="mt-6 grid w-full gap-2">
        <ButtonLink href="/create" variant="gradient" size="lg">
          Create my quiz
        </ButtonLink>
        <ButtonLink href="/" variant="secondary" size="lg">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
