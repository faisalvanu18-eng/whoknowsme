import { Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Avatar } from "@/components/avatar";

/** Pure server component, CSS-only animation: zero JS cost for the LCP area. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 pb-10 pt-10 sm:px-6 md:grid-cols-2 md:pt-16">
        <div className="text-center md:text-left">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-bold text-primary shadow-sm">
            <Sparkles className="size-3.5" aria-hidden /> Free · Sign-up nahi · 30 second
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            Tumhare dost tumhe <span className="text-brand-gradient">kitna</span> jaante hain?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Apne baare mein ek chhota quiz banao, link bhejo aur dekho kiska score kitna aaya. Leaderboard sirf tumhe dikhega.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row md:justify-start">
            <ButtonLink href="/create" variant="gradient" size="xl" className="w-full sm:w-auto">
              Mera quiz banao
            </ButtonLink>
            <ButtonLink href="/how-it-works" variant="ghost" size="xl" className="w-full sm:w-auto">
              Kaise kaam karta hai
            </ButtonLink>
          </div>
        </div>

        <div aria-hidden className="relative mx-auto w-full max-w-sm">
          <div className="animate-float rounded-3xl border bg-card p-5 shadow-2xl shadow-primary/20">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Avatar id="fox-violet" size={32} /> Sam ka quiz · 3/10
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div className="h-2 w-[30%] rounded-full bg-brand-gradient" />
            </div>
            <p className="mt-4 text-lg font-extrabold">Mera comfort food kya hai?</p>
            <div className="mt-3 grid gap-2">
              {["Pizza", "Maggi", "Biryani", "Ice cream"].map((o, i) => (
                <div key={o} className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold ${i === 2 ? "border-primary bg-primary/10 text-primary" : ""}`}>
                  {o}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-sm font-extrabold shadow-xl">
            <Avatar id="cat-blue" size={28} /> 9/10 · Pakka Bestie 🫶
          </div>
          <div className="absolute -right-2 -top-4 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-sm font-extrabold shadow-xl">
            <Avatar id="panda-pink" size={28} /> 4/10 😬
          </div>
        </div>
      </div>
    </section>
  );
}
