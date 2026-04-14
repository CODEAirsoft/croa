import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CROA",
    short_name: "CROA",
    description: "Central de Registro de Operador de Airsoft.",
    start_url: "/",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#111111",
    icons: [
      {
        src: "/code-airsoft-logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/code-airsoft-logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
