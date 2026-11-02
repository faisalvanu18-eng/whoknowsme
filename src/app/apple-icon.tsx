import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#7047EB,#3984F7)" }}>
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path d="M32 54s-22-13-22-28.5C10 17 16 12 23 12c4 0 7 2 9 5 2-3 5-5 9-5 7 0 13 5 13 13.5C54 41 32 54 32 54Z" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  );
}
