import { ImageResponse } from "next/og";

const SIZES: Record<string, { px: number; pad: number }> = {
  "192": { px: 192, pad: 0 },
  "512": { px: 512, pad: 0 },
  maskable: { px: 512, pad: 80 },
};

export function generateStaticParams() {
  return Object.keys(SIZES).map((size) => ({ size }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size } = await ctx.params;
  const cfg = SIZES[size] ?? SIZES["192"];
  const inner = cfg.px - cfg.pad * 2;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#7047EB,#3984F7)", borderRadius: cfg.pad ? 0 : cfg.px * 0.22 }}>
        <div style={{ width: inner * 0.7, height: inner * 0.7, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <svg width={inner * 0.7} height={inner * 0.7} viewBox="0 0 64 64">
            <path d="M32 54s-22-13-22-28.5C10 17 16 12 23 12c4 0 7 2 9 5 2-3 5-5 9-5 7 0 13 5 13 13.5C54 41 32 54 32 54Z" fill="#fff" />
          </svg>
          <div style={{ position: "absolute", display: "flex", fontSize: inner * 0.3, fontWeight: 900, color: "#7047EB", top: inner * 0.12 }}>?</div>
        </div>
      </div>
    ),
    { width: cfg.px, height: cfg.px, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
