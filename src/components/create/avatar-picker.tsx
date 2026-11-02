"use client";

import { AVATAR_ANIMALS, AVATAR_COLORS, avatarSvg, parseAvatar } from "@/data/avatars";
import { cn } from "@/lib/utils";

const SWATCH: Record<string, string> = {
  violet: "#7047EB",
  blue: "#3984F7",
  pink: "#EC4899",
  mint: "#10B981",
  sun: "#F59E0B",
  coral: "#F43F5E",
};

export function AvatarPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { animal, color } = parseAvatar(value);
  return (
    <div>
      <div role="radiogroup" aria-label="Avatar" className="grid grid-cols-5 gap-2">
        {AVATAR_ANIMALS.map((a) => {
          const id = `${a}-${color}`;
          const selected = a === animal;
          return (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={a}
              onClick={() => onChange(id)}
              className={cn(
                "aspect-square rounded-full p-0.5 transition-transform active:scale-90",
                selected ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100",
              )}
            >
              <span className="block size-full" dangerouslySetInnerHTML={{ __html: avatarSvg(id) }} />
            </button>
          );
        })}
      </div>
      <div role="radiogroup" aria-label="Avatar colour" className="mt-3 flex justify-center gap-2">
        {AVATAR_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === color}
            aria-label={c}
            onClick={() => onChange(`${animal}-${c}`)}
            className={cn("size-11 rounded-full border-4 transition-transform active:scale-90", c === color ? "border-foreground" : "border-transparent")}
            style={{ background: SWATCH[c] }}
          />
        ))}
      </div>
    </div>
  );
}
