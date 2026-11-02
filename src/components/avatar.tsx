import { avatarSvg, isAvatarId } from "@/data/avatars";
import { cn } from "@/lib/utils";

/** Inline SVG avatar. The markup comes from our own generator (ids are validated), never user input. */
export function Avatar({ id, size = 48, className }: { id: string; size?: number; className?: string }) {
  const safe = isAvatarId(id) ? id : "fox-violet";
  return (
    <span
      className={cn("inline-block shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: avatarSvg(safe) }}
    />
  );
}
