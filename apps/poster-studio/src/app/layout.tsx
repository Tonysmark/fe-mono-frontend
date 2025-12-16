import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poster Studio",
  description: "电子版海报生成器（编辑 + 导出 PNG）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
