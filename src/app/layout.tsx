import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "인수인계 태스크 관리",
  description: "인계자가 주차별 태스크로 인수인계 내용을 구조화하는 MVP",
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
