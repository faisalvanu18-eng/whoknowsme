"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Copy, Download, Ghost, QrCode, Send, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { channelUrl, snapchatUrl } from "@/lib/share";
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
  const [snapCopied, setSnapCopied] = useState<"ok" | "failed" | null>(null);
  const [busy, setBusy] = useState(false);

  const log = (channel: ShareChannel) => {
    haptic();
    track(kind === "result" ? "result_shared" : "share_clicked", { channel, slug });
  };

  const open = (channel: ShareChannel) => {
    log(channel);
    window.open(channelUrl(channel, text, url), "_blank", "noopener,noreferrer");
  };

  /** Clipboard write with a fallback for in-app browsers without the async clipboard API. */
  const writeClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  };

  /**
   * Snapchat step 1: copy the message + link. Snapchat does not let any app or website drop a
   * text/link message into a chat, so the user pastes it themselves (step 2 opens the app).
   */
  const snapCopy = async () => {
    log("snapchat");
    const ok = await writeClipboard(`${text}\n${url}`);
    setSnapCopied(ok ? "ok" : "failed");
  };

  /** Snapchat step 2: open the app (or Snapchat for Web on desktop, which can send the link itself). */
  const snapOpen = () => {
    haptic();
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) {
      window.location.assign(`intent://#Intent;scheme=snapchat;package=com.snapchat.android;S.browser_fallback_url=${encodeURIComponent("https://www.snapchat.com/")};end`);
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      window.location.assign("snapchat://");
    } else {
      window.open(snapchatUrl(url, false), "_blank", "noopener,noreferrer");
    }
  };

  /** Optional: send the quiz photo (QR + link inside) via the share sheet -> Snapchat "Send to". */
  const snapPhoto = async () => {
    if (!storyImageUrl || !("share" in navigator)) return;
    setBusy(true);
    try {
      prefetchStory();
      const blob = await storyBlob.current!;
      const file = new File([blob], "who-knows-me.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: `${text}\n${url}` });
    } catch {
      /* cancelled or unsupported */
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    log("copy");
    await writeClipboard(`${text}\n${url}`);
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
      {snapCopied === null ? (
        <Button variant="snapchat" size="xl" className="w-full" onClick={snapCopy} onPointerDown={prefetchStory}>
          <Ghost className="size-6" aria-hidden /> Snapchat pe bhejo
        </Button>
      ) : (
        <div className="animate-pop-in space-y-3 rounded-2xl border-2 border-[#FFFC00] bg-[#FFFC00]/10 p-4" role="status">
          {snapCopied === "ok" ? (
            <p className="flex items-center gap-2 font-extrabold">
              <Check className="size-5 text-success" aria-hidden /> Link copy ho gaya!
            </p>
          ) : (
            <div>
              <p className="font-extrabold">Copy nahi hua. Ye link khud copy karo:</p>
              <p className="mt-1 select-all break-all rounded-lg bg-card p-2 text-sm">{url}</p>
            </div>
          )}
          <Button variant="snapchat" size="xl" className="w-full" onClick={snapOpen}>
            <Ghost className="size-6" aria-hidden /> Snapchat kholo
          </Button>
          <ol className="list-decimal space-y-0.5 pl-5 text-sm text-muted-foreground">
            <li>Snapchat mein dost ki chat kholo.</li>
            <li>Message box pe long-press karke <b>Paste</b> karo.</li>
            <li>Send dabao. Ho gaya! 🎉</li>
          </ol>
          <div className="flex flex-wrap gap-x-4 text-sm">
            <button type="button" onClick={snapCopy} className="min-h-11 font-semibold text-primary underline">
              Link dobara copy karo
            </button>
            {storyImageUrl && (
              <button type="button" onClick={snapPhoto} disabled={busy} className="min-h-11 font-semibold text-primary underline">
                Photo ke saath bhejo
              </button>
            )}
          </div>
        </div>
      )}

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
