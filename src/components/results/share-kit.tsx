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
  const [snapHint, setSnapHint] = useState(false);
  const [busy, setBusy] = useState(false);

  const log = (channel: ShareChannel) => {
    haptic();
    track(kind === "result" ? "result_shared" : "share_clicked", { channel, slug });
  };

  const open = (channel: ShareChannel) => {
    log(channel);
    window.open(channelUrl(channel, text, url), "_blank", "noopener,noreferrer");
  };

  /**
   * Snapchat does not accept plain text/links from other apps into a chat; it only opens the
   * "Send to" (friends) screen for a PHOTO or video. So on phones we share the quiz image as a file
   * through the system share sheet: user taps Snapchat, the photo lands on Send to, they pick
   * friends and send. The link is copied to the clipboard so it can be pasted as a caption or
   * attached with Snapchat's link (paperclip) tool.
   * Fallbacks: Android intent with the text (app opens, user pastes), camera link, web share page.
   */
  const snapchat = async () => {
    log("snapchat");
    const ua = navigator.userAgent;
    const android = /Android/i.test(ua);
    const mobile = android || /iPhone|iPad|iPod/i.test(ua);
    const full = `${text}\n${url}`;
    try {
      await navigator.clipboard?.writeText(full);
    } catch {
      /* clipboard blocked: the share/caption still works */
    }
    setSnapHint(true);

    if (!mobile) {
      window.open(snapchatUrl(url, false), "_blank", "noopener,noreferrer");
      return;
    }

    if (storyImageUrl && "share" in navigator) {
      setBusy(true);
      try {
        prefetchStory();
        const blob = await storyBlob.current!;
        const file = new File([blob], "who-knows-me.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          // text is ignored by Snapchat but used by other apps if the user picks them instead
          await navigator.share({ files: [file], text: full });
          return;
        }
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return; // user closed the share sheet
      } finally {
        setBusy(false);
      }
    }

    if (android) {
      const fallback = encodeURIComponent(snapchatUrl(url, true));
      window.location.assign(`intent:#Intent;action=android.intent.action.SEND;type=text/plain;package=com.snapchat.android;S.android.intent.extra.TEXT=${encodeURIComponent(full)};S.browser_fallback_url=${fallback};end`);
    } else {
      window.location.assign(snapchatUrl(url, true));
    }
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
      <Button variant="snapchat" size="xl" className="w-full" onClick={snapchat} onPointerDown={prefetchStory} disabled={busy}>
        <Ghost className="size-6" aria-hidden /> Snapchat pe bhejo
      </Button>
      {snapHint && (
        <div className="rounded-xl bg-muted p-3 text-sm" role="status">
          <p className="font-bold">Share list mein Snapchat chuno 👻</p>
          <ol className="mt-1 list-decimal pl-5 text-muted-foreground">
            <li>Quiz ki photo Snapchat ke &quot;Send to&quot; pe aa jayegi.</li>
            <li>Link copy ho gaya hai. Caption mein paste karo, ya 📎 (paperclip) se link lagao.</li>
            <li>Dost chuno aur Send dabao.</li>
          </ol>
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
