export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tip"; text: string };

export type Article = {
  slug: string;
  title: string;
  description: string;
  /** ISO date */
  date: string;
  updated?: string;
  category: "Questions" | "Friendship" | "How-to" | "Safety";
  emoji: string;
  blocks: Block[];
  /** related pack for a contextual CTA */
  pack?: string;
};
