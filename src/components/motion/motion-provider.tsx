"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

// Animation features are code-split and fetched after first paint (~15KB) instead of shipping
// the full motion bundle. reducedMotion="user" honours prefers-reduced-motion everywhere.
const loadFeatures = () => import("./motion-features").then((m) => m.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
