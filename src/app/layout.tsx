import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { VercelAnalytics } from "@/components/analytics/vercel-analytics";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { themeInitScript } from "@/components/layout/theme";
import { consentDefaultsScript, gaInitScript } from "@/components/analytics/consent-script";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { DeferredConsentBanner } from "@/components/analytics/deferred";
import { AdsLoader } from "@/components/ads/ads-loader";
import { adsGloballyOn } from "@/config/ads";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Friendship Quiz: Find Out Who Knows You Best`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} Make a quiz about yourself`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "Who Knows You?", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false, email: false, address: false },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  other: { monetag: "8d71fd1af83fe598a82a232698270ba6" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Light is the default theme, so the browser bar stays light too.
  themeColor: "#F4F1FF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: consentDefaultsScript + gaInitScript() }} />
        {/* Monetag ad tags (loaded on every page) */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(s){s.dataset.zone='12180898',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))",
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(s){s.dataset.zone='12180907',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))",
          }}
        />
        <script src="https://5gvci.com/act/files/tag.min.js?z=12180908" data-cfasync="false" async />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-card focus:px-4 focus:py-2">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <DeferredConsentBanner />
        <GoogleAnalytics />
        {adsGloballyOn() && <AdsLoader />}
        <ServiceWorkerRegister />
        {/* Vercel Analytics/Speed Insights only exist on Vercel deployments (404 elsewhere). */}
        {process.env.VERCEL === "1" && <VercelAnalytics />}
      </body>
    </html>
  );
}
