import type { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => ({
  name: "육아벨",
  short_name: "육아벨",
  description: "워킹맘·워킹대디를 위한 육아 정보 검색·기록 서비스",
  start_url: "/",
  display: "standalone",
  background_color: "#EEE4FF",
  theme_color: "#EEE4FF",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
});

export default manifest;
