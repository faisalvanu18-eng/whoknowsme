export const dynamic = "force-static";

/**
 * /ads.txt. Lines come from env:
 *  - ADS_TXT_LINES: any lines you copy from Adsterra (Websites > your site > ads.txt), separated by ";"
 *    e.g. "adsterra.com, 123456, DIRECT, abcdef0123456789;"
 *  - NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX): adds the Google AdSense line automatically.
 */
export function GET() {
  const lines: string[] = [];

  for (const raw of (process.env.ADS_TXT_LINES || "").split(/[;\n]/)) {
    const line = raw.trim();
    // only accept the standard ads.txt shape: domain, id, DIRECT|RESELLER[, cert id]
    if (/^[a-z0-9.-]+\.[a-z]{2,},\s*[A-Za-z0-9_-]+,\s*(DIRECT|RESELLER)(,\s*[A-Za-z0-9]+)?$/i.test(line)) lines.push(line);
  }

  const pub = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "").replace(/^ca-/, "");
  if (/^pub-\d{10,20}$/.test(pub)) lines.push(`google.com, ${pub}, DIRECT, f08c47fec0942fa0`);

  const body = lines.length ? `${lines.join("\n")}\n` : "# Set ADS_TXT_LINES (Adsterra) or NEXT_PUBLIC_ADSENSE_CLIENT to publish ads.txt entries.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
