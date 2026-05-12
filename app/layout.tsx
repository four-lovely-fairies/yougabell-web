import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "육아밸",
  description: "워킹맘/워킹대디를 위한 육아 정보·기록·AI 챗봇",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}
