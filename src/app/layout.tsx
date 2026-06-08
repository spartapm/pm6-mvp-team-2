import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Batong",
  description: "Batong 인수인계 태스크 관리 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
