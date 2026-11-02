import Link from "next/link";
import { LogoMark } from "@/components/layout/logo";
import { CookieSettingsLink } from "@/components/analytics/cookie-settings-link";
import { FOOTER_LINKS, SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-card/50">
      <div className="mx-auto max-w-5xl px-4 py-10 pb-safe sm:px-6">
        <div className="flex items-center gap-2 font-extrabold">
          <LogoMark size={28} /> {SITE_NAME}
        </div>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          A free friendship quiz. No sign-up, no emails, no phone numbers. Friends&apos; answers are deleted after 7 days. For ages 13+.
        </p>
        <nav aria-label="Footer" className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-sm font-semibold text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link href="/me" className="flex min-h-11 items-center text-sm font-semibold text-muted-foreground hover:text-foreground">
            My quizzes
          </Link>
          <CookieSettingsLink />
        </nav>
        <p className="mt-6 text-xs text-muted-foreground">© {new Date().getFullYear()} {SITE_NAME}. Made for friends, not for data.</p>
      </div>
    </footer>
  );
}
