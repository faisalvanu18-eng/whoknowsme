import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7047EB" />
          <stop offset="1" stopColor="#3984F7" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#lg)" />
      <path
        d="M32 48s-14-8.4-14-18.2C18 24.4 22 21 26.3 21c2.6 0 4.6 1.3 5.7 3.2 1.1-1.9 3.1-3.2 5.7-3.2C42 21 46 24.4 46 29.8 46 39.6 32 48 32 48Z"
        fill="#fff"
      />
      <text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="900" fill="#7047EB" fontFamily="system-ui">
        ?
      </text>
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2 font-extrabold tracking-tight" aria-label="Who Knows You Better? home">
      <LogoMark />
      <span className="text-[1.05rem] leading-none">
        Who Knows <span className="text-brand-gradient">You</span> Better?
      </span>
    </Link>
  );
}
