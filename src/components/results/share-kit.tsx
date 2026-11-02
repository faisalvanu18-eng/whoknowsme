"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Copy, Download, QrCode, Send, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { channelUrl } from "@/lib/share";
import { track } from "@/lib/analytics/events";
import { haptic } from "@/lib/haptics";
import type { ShareChannel } from "@/lib/validations";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  text: string;
  kind: "quiz" | "result";
  slug?: string;
  /** /api/story?... image for Instagram Stories */
  storyImageUrl?: string;
  className?: string;
  compact?: boolean;
};

export function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4ZM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8ZM20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.4Z" />
    </svg>
  );
}

export function useCanShare() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection after hydration
    setCan(typeof navigator !== "undefined" && "share" in navigator);
  }, []);
  return can;
}

export function ShareKit({ url, text, kind, slug, storyImageUrl, className, compact }: Props) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [storyHelp, setStoryHelp] = useState(false);
  const [busy, setBusy] = useState(false);

  const log = (channel: ShareChannel) => {
    haptic();
    track(kind === "result" ? "result_shared" : "share_clicked", { channel, slug });
  };

  const open = (channel: ShareChannel) => {
    log(channel);
    window.open(channelUrl(channel, text, url), "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    log("copy");
    const full = `${text}\n${url}`;
    try {
      await navigator.clipboard.writeText(full);
    } catch {
      // In-app browsers without clipboard API
      const ta = document.createElement("textarea");
      ta.value = full;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const native = async () => {
    log("native");
    try {
      await navigator.share({ title: "Who Knows You Better?", text, url });
    } catch {
      /* cancelled */
    }
  };

  const story = async () => {
    if (!storyImageUrl) return;
    log("instagram");
    setBusy(true);
    try {
      prefetchStory();
      const blob = await storyBlob.current!;
      const file = new File([blob], "who-knows-you-better.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.clipboard?.writeText(url);
        } catch {
          /* ignore */
        }
        await navigator.share({ files: [file], title: "Who Knows You Better?" });
        setStoryHelp(true);
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "who-knows-you-better.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        setStoryHelp(true);
      }
    } catch {
      setStoryHelp(true);
    } finally {
      setBusy(false);
    }
  };

  const showQr = async () => {
    log("qr");
    const QR = (await import("qrcode")).default;
    setQr(await QR.toDataURL(url, { margin: 1, width: 480, color: { dark: "#1C1838", light: "#FFFFFF" } }));
  };

  const canNative = useCanShare();
  const storyBlob = useRef<Promise<Blob> | null>(null);
  const prefetchStory = () => {
    if (storyImageUrl && !storyBlob.current) storyBlob.current = fetch(storyImageUrl).then((r) => r.blob());
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Button variant="whatsapp" size="xl" className="w-full" onClick={() => open("whatsapp")}>
        <WhatsAppIcon className="size-6" /> Share on WhatsApp
      </Button>

      <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-2")}>
        {storyImageUrl && (
          <Button variant="secondary" onClick={story} onPointerDown={prefetchStory} disabled={busy} aria-label="Share as Instagram story image">
            <Camera aria-hidden /> {compact ? "Story" : "Insta Story"}
          </Button>
        )}
        <Button variant="secondary" onClick={() => open("telegram")}>
          <Send aria-hidden /> Telegram
        </Button>
        <Button variant="secondary" onClick={copy} aria-live="polite">
          {copied ? <Check aria-hidden className="text-success" /> : <Copy aria-hidden />} {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button variant="secondary" onClick={showQr}>
          <QrCode aria-hidden /> QR code
        </Button>
        {canNative && !compact && (
          <Button variant="secondary" onClick={native} className={storyImageUrl ? "col-span-2" : ""}>
            <Share2 aria-hidden /> More options
          </Button>
        )}
      </div>

      {storyHelp && (
        <div className="rounded-xl bg-muted p-3 text-sm" role="status">
          <p className="font-bold">Post it to your Story 📸</p>
          <ol className="mt-1 list-decimal pl-5 text-muted-foreground">
            <li>Open Instagram and add the saved image to your Story.</li>
            <li>Tap the sticker icon and choose <b>Link</b>.</li>
            <li>Paste your quiz link (we copied it for you).</li>
          </ol>
        </div>
      )}

      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" role="dialog" aria-modal="true" aria-label="QR code" onClick={() => setQr(null)}>
          <div className="w-full max-w-xs rounded-2xl bg-card p-5 text-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code for the quiz link" width={240} height={240} className="mx-auto rounded-xl" />
            <p className="mt-3 text-sm text-muted-foreground">Friends can scan this with their camera.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={qr} download="quiz-qr.png" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 font-bold">
                <Download className="size-5" aria-hidden /> Save
              </a>
              <Button onClick={() => setQr(null)}>
                <X aria-hidden /> Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
