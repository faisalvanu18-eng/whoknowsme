import { ImageResponse } from "next/og";
import { FallbackCard } from "@/lib/og";

export const alt = "Who Knows You Better? Make a friendship quiz about yourself";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(<FallbackCard />, size);
}
