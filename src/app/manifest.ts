import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CC205 Wheel Watch - Pantauan Roda Lokomotif",
    short_name: "CC205 Watch",
    description:
      "Dashboard pemantauan keausan roda lokomotif CC205: status wheelset, action status, estimasi lifetime, dan tren parameter.",
    start_url: "/",
    display: "standalone",
    background_color: "#070b14",
    theme_color: "#070b14",
    lang: "id",
    dir: "ltr",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
