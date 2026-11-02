export const dynamic = "force-static";

/** /ads.txt generated from NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX -> pub-XXXX). */
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  const pub = client.replace(/^ca-/, "");
  const body = /^pub-\d{10,20}$/.test(pub)
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : "# Set NEXT_PUBLIC_ADSENSE_CLIENT to publish your AdSense ads.txt entry.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
