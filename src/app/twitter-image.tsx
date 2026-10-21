import { ImageResponse } from "next/og";
import { OG_ALT, OG_SIZE, OgImage } from "@/components/og-image";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgImage />, { ...OG_SIZE });
}
