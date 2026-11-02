import Link from "next/link";
import { Plus } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme";
import { ButtonLink } from "@/components/ui/button-link";
import { NAV_LINKS } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="pt-safe sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/create" size="sm" className="hidden sm:inline-flex">
            <Plus aria-hidden /> Quiz banao
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
