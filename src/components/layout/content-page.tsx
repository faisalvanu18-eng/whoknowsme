import { Fragment } from "react";
import type { Block } from "@/content/types";
import { AdSlot } from "@/components/ads/ad-slot";
import type { Placement } from "@/config/ads";

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <header className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      {eyebrow && <p className="text-sm font-bold uppercase tracking-widest text-primary">{eyebrow}</p>}
      <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight">{title}</h1>
      {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}
    </header>
  );
}

function renderBlock(b: Block, key: number) {
  switch (b.type) {
    case "p":
      return <p key={key}>{b.text}</p>;
    case "h2":
      return <h2 key={key}>{b.text}</h2>;
    case "h3":
      return <h3 key={key}>{b.text}</h3>;
    case "ul":
      return (
        <ul key={key}>
          {b.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key}>
          {b.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <p key={key} className="rounded-2xl border-l-4 border-primary bg-primary/5 px-4 py-3">
          <strong>Tip: </strong>
          {b.text}
        </p>
      );
  }
}

/**
 * Renders article blocks and injects in-article ads after paragraph N, as configured.
 * Only counts real paragraphs (not headings/lists) so ads always sit between prose.
 */
export function ArticleBody({ blocks, adsAfterParagraph = {} }: { blocks: Block[]; adsAfterParagraph?: Record<number, Placement> }) {
  let p = 0;
  return (
    <div className="prose-content">
      {blocks.map((b, i) => {
        const el = renderBlock(b, i);
        if (b.type !== "p") return el;
        p++;
        const ad = adsAfterParagraph[p];
        return ad ? (
          <Fragment key={i}>
            {el}
            <AdSlot placement={ad} />
          </Fragment>
        ) : (
          el
        );
      })}
    </div>
  );
}
