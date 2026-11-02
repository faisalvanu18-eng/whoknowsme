/**
 * Inline SVG avatars. Zero network requests, ~1KB each, and the same markup is reused in
 * OG images (as a data URI) so previews match the app exactly.
 * Avatar id format: "<animal>-<color>", e.g. "fox-violet".
 */

export const AVATAR_ANIMALS = ["fox", "cat", "bear", "panda", "bunny", "owl", "frog", "penguin", "koala", "monkey"] as const;
export const AVATAR_COLORS = ["violet", "blue", "pink", "mint", "sun", "coral"] as const;
export type AvatarAnimal = (typeof AVATAR_ANIMALS)[number];
export type AvatarColor = (typeof AVATAR_COLORS)[number];

const BG: Record<AvatarColor, string> = {
  violet: "#7047EB",
  blue: "#3984F7",
  pink: "#EC4899",
  mint: "#10B981",
  sun: "#F59E0B",
  coral: "#F43F5E",
};

const HEAD: Record<AvatarAnimal, { fill: string; inner?: string }> = {
  fox: { fill: "#FB923C", inner: "#FFF7ED" },
  cat: { fill: "#FDE68A", inner: "#FFFBEB" },
  bear: { fill: "#A16207", inner: "#FDE68A" },
  panda: { fill: "#FFFFFF" },
  bunny: { fill: "#F5F5F4", inner: "#FBCFE8" },
  owl: { fill: "#92400E", inner: "#FEF3C7" },
  frog: { fill: "#4ADE80", inner: "#DCFCE7" },
  penguin: { fill: "#1F2937", inner: "#FFFFFF" },
  koala: { fill: "#9CA3AF", inner: "#E5E7EB" },
  monkey: { fill: "#B45309", inner: "#FDE68A" },
};

export function isAvatarId(id: string): boolean {
  const [a, c] = id.split("-");
  return (AVATAR_ANIMALS as readonly string[]).includes(a) && (AVATAR_COLORS as readonly string[]).includes(c);
}

export function parseAvatar(id: string): { animal: AvatarAnimal; color: AvatarColor } {
  if (!isAvatarId(id)) return { animal: "fox", color: "violet" };
  const [animal, color] = id.split("-") as [AvatarAnimal, AvatarColor];
  return { animal, color };
}

function ears(animal: AvatarAnimal, fill: string, inner = fill) {
  switch (animal) {
    case "fox":
      return `<path d="M22 46 L28 12 L46 32 Z" fill="${fill}"/><path d="M78 46 L72 12 L54 32 Z" fill="${fill}"/><path d="M28 38 L31 20 L40 31 Z" fill="${inner}"/><path d="M72 38 L69 20 L60 31 Z" fill="${inner}"/>`;
    case "cat":
      return `<path d="M22 44 L26 16 L44 30 Z" fill="${fill}"/><path d="M78 44 L74 16 L56 30 Z" fill="${fill}"/>`;
    case "bear":
    case "monkey":
      return animal === "bear"
        ? `<circle cx="27" cy="32" r="11" fill="${fill}"/><circle cx="73" cy="32" r="11" fill="${fill}"/><circle cx="27" cy="32" r="5" fill="${inner}"/><circle cx="73" cy="32" r="5" fill="${inner}"/>`
        : `<circle cx="20" cy="56" r="10" fill="${fill}"/><circle cx="80" cy="56" r="10" fill="${fill}"/><circle cx="20" cy="56" r="5" fill="${inner}"/><circle cx="80" cy="56" r="5" fill="${inner}"/>`;
    case "panda":
      return `<circle cx="27" cy="32" r="11" fill="#111827"/><circle cx="73" cy="32" r="11" fill="#111827"/>`;
    case "bunny":
      return `<ellipse cx="38" cy="20" rx="7" ry="18" fill="${fill}"/><ellipse cx="62" cy="20" rx="7" ry="18" fill="${fill}"/><ellipse cx="38" cy="22" rx="3.5" ry="12" fill="${inner}"/><ellipse cx="62" cy="22" rx="3.5" ry="12" fill="${inner}"/>`;
    case "owl":
      return `<path d="M26 36 L28 20 L40 30 Z" fill="${fill}"/><path d="M74 36 L72 20 L60 30 Z" fill="${fill}"/>`;
    case "frog":
      return `<circle cx="35" cy="34" r="11" fill="${fill}"/><circle cx="65" cy="34" r="11" fill="${fill}"/>`;
    case "koala":
      return `<circle cx="22" cy="40" r="14" fill="${fill}"/><circle cx="78" cy="40" r="14" fill="${fill}"/><circle cx="22" cy="40" r="8" fill="${inner}"/><circle cx="78" cy="40" r="8" fill="${inner}"/>`;
    case "penguin":
      return "";
  }
}

function face(animal: AvatarAnimal, inner?: string) {
  const eyeY = animal === "frog" ? 34 : 54;
  const eyeX = animal === "frog" ? [35, 65] : [40, 60];
  let s = "";
  if (animal === "penguin" && inner) s += `<ellipse cx="50" cy="62" rx="22" ry="20" fill="${inner}"/>`;
  if (animal === "panda") s += `<ellipse cx="39" cy="54" rx="7" ry="8" fill="#111827"/><ellipse cx="61" cy="54" rx="7" ry="8" fill="#111827"/>`;
  if (animal === "owl" && inner) s += `<circle cx="39" cy="52" r="10" fill="${inner}"/><circle cx="61" cy="52" r="10" fill="${inner}"/>`;
  if ((animal === "fox" || animal === "monkey" || animal === "bear") && inner)
    s += `<ellipse cx="50" cy="68" rx="14" ry="10" fill="${inner}"/>`;
  const eyeFill = animal === "panda" || animal === "penguin" ? "#FFFFFF" : "#1F2937";
  s += `<circle cx="${eyeX[0]}" cy="${eyeY}" r="4" fill="${eyeFill}"/><circle cx="${eyeX[1]}" cy="${eyeY}" r="4" fill="${eyeFill}"/>`;
  s += `<circle cx="${eyeX[0] + 1.3}" cy="${eyeY - 1.3}" r="1.3" fill="${eyeFill === "#FFFFFF" ? "#111827" : "#FFFFFF"}"/><circle cx="${eyeX[1] + 1.3}" cy="${eyeY - 1.3}" r="1.3" fill="${eyeFill === "#FFFFFF" ? "#111827" : "#FFFFFF"}"/>`;
  if (animal === "owl") s += `<path d="M46 60 L54 60 L50 67 Z" fill="#F59E0B"/>`;
  else if (animal === "penguin") s += `<path d="M45 62 L55 62 L50 69 Z" fill="#F59E0B"/>`;
  else if (animal === "koala") s += `<ellipse cx="50" cy="64" rx="6" ry="7" fill="#374151"/>`;
  else s += `<ellipse cx="50" cy="64" rx="3.5" ry="2.6" fill="#1F2937"/>`;
  s += `<path d="M43 71 Q50 77 57 71" stroke="#1F2937" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="32" cy="66" r="4.5" fill="#F472B6" opacity=".45"/><circle cx="68" cy="66" r="4.5" fill="#F472B6" opacity=".45"/>`;
  return s;
}

export function avatarSvg(id: string): string {
  const { animal, color } = parseAvatar(id);
  const head = HEAD[animal];
  const headY = animal === "frog" ? 58 : 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-label="${animal} avatar"><circle cx="50" cy="50" r="50" fill="${BG[color]}"/>${ears(animal, head.fill, head.inner)}<circle cx="50" cy="${headY}" r="30" fill="${head.fill}"/>${face(animal, head.inner)}</svg>`;
}

export function avatarDataUri(id: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg(id))}`;
}

export function randomAvatarId() {
  const a = AVATAR_ANIMALS[Math.floor(Math.random() * AVATAR_ANIMALS.length)];
  const c = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  return `${a}-${c}`;
}
