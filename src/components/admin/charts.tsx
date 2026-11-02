/** Dependency-free, server-rendered SVG charts for the admin dashboard. */

export function BarChart({ data, label, color = "var(--primary)" }: { data: { day: string; value: number }[]; label: string; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 600;
  const h = 140;
  const bw = w / data.length;
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <figure className="rounded-2xl border bg-card p-4">
      <figcaption className="flex items-baseline justify-between">
        <span className="font-bold">{label}</span>
        <span className="text-sm text-muted-foreground">{total.toLocaleString()} total</span>
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h + 18}`} className="mt-2 w-full" role="img" aria-label={`${label} per day`}>
        {data.map((d, i) => {
          const bh = (d.value / max) * h;
          return (
            <g key={d.day}>
              <rect x={i * bw + 1} y={h - bh} width={Math.max(1, bw - 2)} height={bh} rx={2} fill={color}>
                <title>{`${d.day}: ${d.value}`}</title>
              </rect>
              {i % 7 === 0 && (
                <text x={i * bw} y={h + 14} fontSize="10" fill="currentColor" opacity={0.6}>
                  {d.day.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function HBarList({ title, items, format = (n: number) => n.toLocaleString() }: { title: string; items: [string, number][]; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i[1]));
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="font-bold">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map(([k, v]) => (
            <li key={k} className="text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">{k}</span>
                <span className="tabular-nums text-muted-foreground">{format(v)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-brand-gradient" style={{ width: `${(v / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="font-bold">Funnel</p>
      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => {
          const prev = i === 0 ? s.value : steps[i - 1].value;
          const step = prev ? Math.round((s.value / prev) * 100) : 0;
          return (
            <li key={s.label}>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{s.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {s.value.toLocaleString()} {i > 0 && `· ${step}% of previous`}
                </span>
              </div>
              <div className="mt-1 h-3 rounded-full bg-muted">
                <div className="h-3 rounded-full bg-primary" style={{ width: `${(s.value / top) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
