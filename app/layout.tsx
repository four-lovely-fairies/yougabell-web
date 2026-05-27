import type { Metadata, Viewport } from "next";
import { NativeSessionBridge } from "@/components/app/native-session-bridge";
import "./globals.css";

export const metadata: Metadata = {
  title: "육아밸",
  description: "워킹맘/워킹대디를 위한 육아 정보·기록·AI 챗봇",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-[#f1f2f4] font-sans text-gray-800">
        <NativeSessionBridge />
        {/* 모바일 frame — 태블릿/데스크탑에서는 가운데 정렬된 모바일 폭(430px)으로 표시 */}
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
          {children}
        </div>
      </body>
    </html>
  );
}
