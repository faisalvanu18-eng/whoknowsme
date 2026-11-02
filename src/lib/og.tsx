import { avatarDataUri } from "@/data/avatars";

/**
 * JSX for share images rendered by next/og (Satori). Used for Open Graph previews (1200x630)
 * and Instagram Story images (1080x1920). No emoji / remote fonts so rendering is fast and offline.
 */

type CardProps = {
  avatar: string;
  nickname: string;
  title: string;
  score?: { score: number; total: number; tier: string; friend?: string | null };
  size?: number;
  variant: "og" | "story";
  /** Story only: QR code (data URI) + readable link, because Snapchat drops text sent with a photo. */
  qr?: string;
  link?: string;
};

export function ShareCard({ avatar, nickname, title, score, size, variant, qr, link }: CardProps) {
  const story = variant === "story";
  const s = story ? 1.6 : 1;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#7047EB 0%,#3984F7 100%)",
        fontFamily: "sans-serif",
        color: "#fff",
        padding: story ? 90 : 56,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#FFFFFF",
          color: "#1C1838",
          borderRadius: 48 * s,
          padding: `${44 * s}px ${56 * s}px`,
          width: "100%",
          boxShadow: "0 30px 80px rgba(23,21,37,.35)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarDataUri(avatar)} width={150 * s} height={150 * s} alt="" style={{ borderRadius: 999 }} />
        <div style={{ display: "flex", marginTop: 18 * s, fontSize: 30 * s, fontWeight: 700, color: "#7047EB" }}>
          {score ? `${score.friend ? score.friend : "A friend"} took ${nickname}'s quiz` : `${nickname} made a quiz`}
        </div>
        <div
          style={{
            display: "flex",
            textAlign: "center",
            marginTop: 10 * s,
            fontSize: (title.length > 40 ? 46 : 56) * s,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: story ? 820 : 960,
            justifyContent: "center",
          }}
        >
          {title}
        </div>
        {score ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 26 * s }}>
            <div style={{ display: "flex", fontSize: 120 * s, fontWeight: 900, color: "#7047EB", lineHeight: 1 }}>
              {`${score.score}/${score.total}`}
            </div>
            <div style={{ display: "flex", marginTop: 8 * s, fontSize: 38 * s, fontWeight: 800 }}>{score.tier}</div>
          </div>
        ) : (
          <div style={{ display: "flex", marginTop: 26 * s, fontSize: 34 * s, fontWeight: 700, color: "#5B5677" }}>
            {`${size ?? 10} questions · Can you score ${size ?? 10}/${size ?? 10}?`}
          </div>
        )}
        <div
          style={{
            display: "flex",
            marginTop: 30 * s,
            background: "#7047EB",
            color: "#fff",
            borderRadius: 999,
            padding: `${16 * s}px ${36 * s}px`,
            fontSize: 30 * s,
            fontWeight: 800,
          }}
        >
          {score ? "Think you can beat that?" : story && qr ? "Neeche QR scan karo" : "Tap to take the quiz"}
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 30 * s, fontSize: 30 * s, fontWeight: 800, opacity: 0.95 }}>Who Knows You Better?</div>
      {story && qr && (
        <div style={{ display: "flex", alignItems: "center", marginTop: 36, background: "#FFFFFF", color: "#1C1838", borderRadius: 40, padding: "28px 36px", gap: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={260} height={260} alt="" />
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 520 }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 900, color: "#7047EB" }}>Scan karke khelo</div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 30, fontWeight: 600, color: "#5B5677" }}>Snapchat camera se scan karo, ya ye link kholo:</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 34, fontWeight: 800, wordBreak: "break-all" }}>{link}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FallbackCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#7047EB 0%,#3984F7 100%)",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 76, fontWeight: 900 }}>Who Knows You Better?</div>
      <div style={{ display: "flex", fontSize: 36, marginTop: 16, opacity: 0.9 }}>Make a quiz about yourself. Send it to friends.</div>
    </div>
  );
}
